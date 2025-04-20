// src/components/icons/__tests__/icons.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconCommunity from '../IconCommunity.vue'
import IconDocumentation from '../IconDocumentation.vue'
import IconEcosystem from '../IconEcosystem.vue'
import IconSupport from '../IconSupport.vue'
import IconTooling from '../IconTooling.vue'

describe('Icon components', () => {
  it('IconCommunity renders', () => {
    const wrapper = mount(IconCommunity)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('IconDocumentation renders', () => {
    const wrapper = mount(IconDocumentation)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('IconEcosystem renders', () => {
    const wrapper = mount(IconEcosystem)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('IconSupport renders', () => {
    const wrapper = mount(IconSupport)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('IconTooling renders', () => {
    const wrapper = mount(IconTooling)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
