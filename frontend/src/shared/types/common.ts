export interface Pagination<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export interface ApiError {
  message: string
  statusCode?: number
}
