export interface CloudFunctionResult<T = any> {
  success: boolean
  data?: T
  error?: string
}
