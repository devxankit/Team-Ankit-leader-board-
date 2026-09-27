import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminService } from '@/services/adminService'

export const useAdminMembers = (status = 'all') =>
  useQuery({ queryKey: ['admin', 'members', status], queryFn: () => adminService.members(status) })

export const useAdminRules = (status = 'active') =>
  useQuery({ queryKey: ['admin', 'rules', status], queryFn: () => adminService.rules(status) })

export const useAdminEvents = (filters) =>
  useQuery({
    queryKey: ['admin', 'events', filters],
    queryFn: () => adminService.events(filters),
    placeholderData: keepPreviousData,
  })

/**
 * An admin write. On success everything is refetched (scores, lists, logs);
 * errors without per-field messages surface as a toast, field errors are left
 * for the form to show next to the inputs.
 */
export function useAdminAction(mutationFn, { onSuccess } = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (...args) => {
      queryClient.invalidateQueries()
      onSuccess?.(...args)
    },
    onError: (error) => {
      if (!Object.keys(error.fieldErrors ?? {}).length) toast.error(error.message)
    },
  })
}
