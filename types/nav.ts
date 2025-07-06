export interface NavItem {
  title: string
  href?: string
  disabled?: boolean
  external?: boolean
}

export interface Model {
  name: string
  title: string
  description: string
}

export interface ModelSelectProps {
  models: Model[]
  value: string
  onChange: (value: string) => void
  loading?: boolean
}
