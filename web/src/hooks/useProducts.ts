import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { Product, ProductCreate } from '../types/Product';
import { App } from 'antd';

const PRODUCTS_KEY = ['products'];

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: productService.getAll,
  });
}

export function useProduct(id: string | null) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, id],
    queryFn: () => productService.getById(id!),
    enabled: !!id,
  });
}

export function useSearchProducts(searchTerm: string) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, 'search', searchTerm],
    queryFn: () => productService.search(searchTerm),
    enabled: searchTerm.length > 0,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (product: ProductCreate) => productService.create(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      message.success('Producto creado exitosamente');
    },
    onError: () => {
      message.error('Error al crear el producto');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ id, product }: { id: string; product: ProductCreate }) =>
      productService.update(id, product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      message.success('Producto actualizado exitosamente');
    },
    onError: () => {
      message.error('Error al actualizar el producto');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      message.success('Producto eliminado exitosamente');
    },
    onError: () => {
      message.error('Error al eliminar el producto');
    },
  });
}

export function useBulkDeleteProducts() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => productService.delete(id)));
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      message.success(`${ids.length} producto(s) eliminado(s) exitosamente`);
    },
    onError: () => {
      message.error('Error al eliminar los productos');
    },
  });
}
