-- Bảng Users (Liên kết với bảng auth.users của Supabase)
-- Bảng này chủ yếu để tham chiếu dễ dàng hơn, thông tin chính vẫn ở auth.users
-- Bạn có thể không cần tạo bảng này nếu chỉ dùng trực tiếp auth.users.id
-- Tuy nhiên, tạo bảng này có thể hữu ích để thêm các cột thông tin hồ sơ người dùng khác sau này
-- Lưu ý: Cần đảm bảo RLS (Row Level Security) cho phép đọc auth.users nếu cần join
-- Hoặc tạo trigger để đồng bộ dữ liệu từ auth.users sang bảng này nếu cần
-- Tạm thời, chúng ta sẽ giả định có bảng users riêng để dễ quản lý khóa ngoại
CREATE TABLE users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- Tham chiếu trực tiếp đến auth.users
    email text UNIQUE, -- Có thể lấy từ auth.users hoặc quản lý riêng
    full_name text, -- Có thể lấy từ auth.users hoặc quản lý riêng
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);
-- Optional: Trigger để cập nhật updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Bảng Groups
CREATE TABLE groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    created_by uuid NOT NULL REFERENCES users(id) ON DELETE SET NULL, -- Nếu người tạo bị xóa, nhóm vẫn còn nhưng không rõ ai tạo
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TRIGGER set_groups_timestamp
BEFORE UPDATE ON groups
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Bảng Group Members (Bảng nối nhiều-nhiều)
CREATE TABLE group_members (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Nếu user bị xóa, xóa membership
    group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE, -- Nếu group bị xóa, xóa membership
    role text DEFAULT 'member' NOT NULL, -- e.g., 'admin', 'member'
    joined_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, group_id) -- Khóa chính kết hợp
);

-- Bảng Expenses
CREATE TABLE expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE, -- Nếu group bị xóa, xóa expense
    paid_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- Không cho xóa user nếu họ đã trả expense? Hoặc SET NULL? RESTRICT an toàn hơn.
    description text,
    amount decimal(10, 2) NOT NULL CHECK (amount > 0), -- Đảm bảo số tiền dương
    date date NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
    -- split_details jsonb -- Cột tùy chọn cho các kiểu chia phức tạp
);

CREATE TRIGGER set_expenses_timestamp
BEFORE UPDATE ON expenses
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Bảng Expense Shares (Chi tiết cách chia một expense)
CREATE TABLE expense_shares (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id uuid NOT NULL REFERENCES expenses(id) ON DELETE CASCADE, -- Nếu expense bị xóa, xóa share
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Nếu user bị xóa, xóa share của họ
    share_amount decimal(10, 2) NOT NULL CHECK (share_amount >= 0), -- Phần chia sẻ có thể là 0
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
    -- UNIQUE (expense_id, user_id) -- Đảm bảo mỗi user chỉ có 1 share cho 1 expense
);
-- Thêm constraint UNIQUE riêng để dễ đặt tên
ALTER TABLE expense_shares ADD CONSTRAINT unique_expense_user_share UNIQUE (expense_id, user_id);


CREATE TRIGGER set_expense_shares_timestamp
BEFORE UPDATE ON expense_shares
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Bảng Payments (Ghi lại việc giải quyết nợ)
CREATE TABLE payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE, -- Nếu group bị xóa, xóa payment
    paid_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- Không cho xóa user nếu họ đã trả tiền
    paid_to_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- Không cho xóa user nếu họ đã nhận tiền
    amount decimal(10, 2) NOT NULL CHECK (amount > 0),
    date date NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CHECK (paid_by_user_id <> paid_to_user_id) -- Đảm bảo người trả và người nhận khác nhau
);

CREATE TRIGGER set_payments_timestamp
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Optional: Indexes for performance on frequently queried columns
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_expenses_group_id ON expenses(group_id);
CREATE INDEX idx_expenses_paid_by_user_id ON expenses(paid_by_user_id);
CREATE INDEX idx_expense_shares_expense_id ON expense_shares(expense_id);
CREATE INDEX idx_expense_shares_user_id ON expense_shares(user_id);
CREATE INDEX idx_payments_group_id ON payments(group_id);
CREATE INDEX idx_payments_paid_by_user_id ON payments(paid_by_user_id);
CREATE INDEX idx_payments_paid_to_user_id ON payments(paid_to_user_id);
