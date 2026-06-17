import React from 'react';
import { FiDownload, FiStar } from 'react-icons/fi';
import Button from './Button';

export interface ProductCardProps {
  title: string;
  author: string;
  price: number;
  rating?: number;
  image?: string;
  onPurchase?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  title, 
  author, 
  price, 
  rating = 5.0, 
  image, 
  onPurchase 
}) => {
  return (
    <div className="bg-[var(--color-surface)] border border-[rgba(255,255,255,0.05)] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:border-[rgba(255,255,255,0.15)] group">
      {/* Product Image */}
      <div className="h-48 w-full bg-[#111] relative overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a3a1a] to-[var(--color-background)] flex items-center justify-center opacity-80 group-hover:scale-105 transition-transform duration-500">
            <FiDownload className="w-8 h-8 text-[var(--color-primary)] opacity-50" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-[var(--color-background)]/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-[rgba(255,255,255,0.1)] flex items-center gap-1">
          <FiStar className="w-3 h-3 text-[#FFC107] fill-[#FFC107]" />
          <span className="text-xs text-white font-medium">{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-[var(--color-text-primary)] font-bold text-lg mb-1 line-clamp-2">{title}</h3>
        <p className="text-[var(--color-text-secondary)] text-sm mb-4">By {author}</p>
        
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider">Price</span>
            <span className="text-[var(--color-primary)] font-bold text-xl">${price.toFixed(2)}</span>
          </div>
          
          <Button onClick={onPurchase} variant="primary" className="py-2 px-4">
            Get Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
