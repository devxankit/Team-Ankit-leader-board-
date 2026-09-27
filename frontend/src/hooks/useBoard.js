import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { boardService } from '@/services/boardService'

export const useLeaderboard = (period) =>
  useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => boardService.leaderboard(period),
    placeholderData: keepPreviousData,
  })

export const useActivity = (limit = 40) =>
  useQuery({ queryKey: ['activity', limit], queryFn: () => boardService.activity(limit) })

export const useMemberHistory = (memberId) =>
  useInfiniteQuery({
    queryKey: ['history', memberId],
    queryFn: ({ pageParam }) => boardService.history(memberId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    enabled: Boolean(memberId),
  })
