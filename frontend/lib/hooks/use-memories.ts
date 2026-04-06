// lib/hooks/use-memories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { memoriesApi } from '@/lib/api'
import type { Memory } from '@/lib/types'

export function useMemories(params?: Parameters<typeof memoriesApi.list>[0]) {
    return useQuery({
        queryKey: ['memories', params],
        queryFn: () => memoriesApi.list(params),
        staleTime: 30_000,
    })
}

export function useMemory(id: string) {
    return useQuery({
        queryKey: ['memory', id],
        queryFn: () => memoriesApi.get(id),
        enabled: !!id && id !== 'undefined',
    })
}

export function useRelatedMemories(id: string) {
    return useQuery({
        queryKey: ['memory', id, 'related'],
        queryFn: () => memoriesApi.related(id),
        enabled: !!id && id !== 'undefined',
    })
}

export function useDeleteMemory() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => memoriesApi.delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['memories'] }),
    })
}

export function useUpdateMemory() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...body }: { id: string } & Parameters<typeof memoriesApi.update>[1]) =>
            memoriesApi.update(id, body),
        onSuccess: (data: Memory) => {
            qc.invalidateQueries({ queryKey: ['memories'] })
            qc.setQueryData(['memory', data.id], data)
        },
    })
}
