import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelloWorld from '../HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders msg prop', () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })

  it('h1 có class green', () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Test' } })
    const h1 = wrapper.find('h1')
    expect(h1.classes()).toContain('green')
  })

  it('có 2 link đúng href', () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Test' } })
    const links = wrapper.findAll('a')
    expect(links.length).toBe(2)
    expect(links[0].attributes('href')).toContain('vite')
    expect(links[1].attributes('href')).toContain('vuejs')
  })

  it('matches snapshot', () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Snapshot' } })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
