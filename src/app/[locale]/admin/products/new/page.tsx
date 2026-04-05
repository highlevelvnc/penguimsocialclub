import { getSubcategories } from '@/actions/products'
import { ProductForm } from '@/components/admin/product-form'

export default async function NewProductPage() {
  const subcategories = await getSubcategories()

  return (
    <div className="max-w-2xl">
      <ProductForm
        mode="create"
        subcategories={subcategories}
      />
    </div>
  )
}
