'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useProduct } from '@/lib/instantdbHooks'

export default function Product() {

    const { productId } = useParams();
    const products = useSelector(state => state.product.list || []);
    const { product, isLoading } = useProduct(productId)

    // If product isn't in Instant DB yet, try finding it in the redux dummy list
    const effectiveProduct = product || products.find(p => p.id === productId) || null

    useEffect(() => {
        scrollTo(0, 0)
    }, [productId]);

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrums */}
                <div className="  text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {effectiveProduct?.category}
                </div>

                {/* Product Details */}
                {isLoading ? (
                    <p className="text-slate-500">Loading product...</p>
                ) : effectiveProduct ? (
                    <>
                        <ProductDetails product={effectiveProduct} />
                        <ProductDescription product={effectiveProduct} />
                    </>
                ) : (
                    <p className="text-slate-500">Product not found.</p>
                )}
            </div>
        </div>
    );
}