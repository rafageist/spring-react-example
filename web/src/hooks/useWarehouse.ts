import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseService } from '../services/warehouseService';
import { Category, Location } from '../types/Warehouse';

// Categories hooks
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => warehouseService.getCategories(),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: Omit<Category, 'id'>) => warehouseService.createCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, category }: { id: string; category: Partial<Category> }) =>
      warehouseService.updateCategory(id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => warehouseService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// Locations hooks
export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: () => warehouseService.getLocations(),
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (location: Omit<Location, 'id'>) => warehouseService.createLocation(location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, location }: { id: string; location: Partial<Location> }) =>
      warehouseService.updateLocation(id, location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => warehouseService.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

// Product position update
export function useUpdateProductPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      position,
    }: {
      productId: string;
      position: { posX: number; posY: number; locationId?: string | null };
    }) => warehouseService.updateProductPosition(productId, position),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
