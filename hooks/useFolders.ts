import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FolderService, Folder } from '@/services/folder.service';

export const useFolders = (parentId: string | null = null) => {
    const queryClient = useQueryClient();

    const { data: folders, isLoading, error } = useQuery({
        queryKey: ['folders', parentId],
        queryFn: () => FolderService.getFolders(parentId),
    });

    const createFolderMutation = useMutation({
        mutationFn: ({ name, parentId }: { name: string, parentId: string | null }) =>
            FolderService.createFolder(name, parentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['folders', parentId] });
        },
    });

    const deleteFolderMutation = useMutation({
        mutationFn: (id: string) => FolderService.deleteFolder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['folders', parentId] });
        },
    });

    return {
        folders,
        isLoading,
        error,
        createFolder: createFolderMutation.mutateAsync,
        deleteFolder: deleteFolderMutation.mutateAsync,
    };
};
