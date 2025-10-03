import * as React from 'react'
import { toast, type ExternalToast } from 'sonner'
import { Check, Info, Loader2, AlertTriangle, XCircle } from 'lucide-react'

const defaultIcons = {
  success: <Check className='text-green-500' />,
  error: <XCircle className='text-red-500' />,
  info: <Info className='text-blue-500' />,
  warning: <AlertTriangle className='text-yellow-500' />,
  loading: <Loader2 className='animate-spin text-zinc-400' />,
}

const withDefaultIcon = (options: ExternalToast | undefined, fallback: React.ReactNode): ExternalToast => {
  return {
    ...options,
    icon: fallback,
  }
}

export function toastSuccess(title: string, options?: ExternalToast) {
  toast.success(title, withDefaultIcon(options, defaultIcons.success))
}

export function toastError(title: string, options?: ExternalToast) {
  toast.error(title, withDefaultIcon(options, defaultIcons.error))
}

export function toastInfo(title: string, options?: ExternalToast) {
  toast.info(title, withDefaultIcon(options, defaultIcons.info))
}

export function toastWarning(title: string, options?: ExternalToast) {
  toast.warning(title, withDefaultIcon(options, defaultIcons.warning))
}

export function toastLoading(title: string, options?: ExternalToast) {
  toast.loading(title, withDefaultIcon(options, defaultIcons.loading))
}

export function toastNormal(title: string, options?: ExternalToast) {
  toast(title, options)
}

export function toastDismiss(id?: number | string) {
  toast.dismiss(id)
}

export function toastCustom(jsx: (id: number | string) => React.ReactElement, options?: ExternalToast) {
  toast.custom(jsx, options)
}
