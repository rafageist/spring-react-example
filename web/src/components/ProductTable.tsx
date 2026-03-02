import { Product } from '../types/Product';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

export function ProductTable({ products, onEdit, onDelete, loading }: ProductTableProps) {
  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (products.length === 0) {
    return <div className="empty">No products found</div>;
  }

  return (
    <table className="product-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map(product => (
          <tr key={product.id}>
            <td>{product.name}</td>
            <td>{product.description || '-'}</td>
            <td>${product.price.toFixed(2)}</td>
            <td>{product.stock}</td>
            <td className="actions">
              <button 
                className="btn btn-small btn-edit" 
                onClick={() => onEdit(product)}
              >
                Edit
              </button>
              <button 
                className="btn btn-small btn-delete" 
                onClick={() => onDelete(product.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
