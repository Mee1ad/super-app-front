'use client';

import { useState, useEffect } from "react";
import { X, Check, Link, DollarSign, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileKeyboardFocusWithBackGesture } from "@/hooks/use-mobile-keyboard-focus";

export type NewShoppingProps = {
  onCreate: (title: string, url: string, price: string, source: string) => void;
  onClose?: () => void;
};

export function NewShopping({ onCreate, onClose }: NewShoppingProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [source, setSource] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [showSource, setShowSource] = useState(false);
  
  // Prevent scroll when form is open (always open in this component)
  useEffect(() => {
    // Store current scroll position
    const scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    
    // Cleanup on unmount
    return () => {
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }
  }, [])
  
  const { ref: titleInputRef, keyboardHeight } = useMobileKeyboardFocusWithBackGesture(
    true,
    () => {
      // Auto-close form when keyboard is dismissed on mobile
      if (window.innerWidth <= 768) {
        handleClose();
      }
    },
    () => {
      // Auto-close form when back gesture is used
      if (window.innerWidth <= 768) {
        handleClose();
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only require title initially, URL and price are optional unless their inputs are shown
    if (title.trim()) {
      const finalUrl = showUrl ? url : "";
      const finalPrice = showPrice ? price : "";
      onCreate(title.trim(), finalUrl, finalPrice, source);
      // Keep form open for adding another item
      setTitle("");
      setUrl("");
      setPrice("");
      setSource("");
      setShowUrl(false);
      setShowPrice(false);
      setShowSource(false);
      // Re-focus the title input for quick entry
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  };

  const handleClose = () => {
    setTitle("");
    setUrl("");
    setPrice("");
    setSource("");
    setShowUrl(false);
    setShowPrice(false);
    setShowSource(false);
    onClose?.();
  };

  return (
    <>
      {/* Dark background overlay */}
      <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={handleClose} />
      
      {/* Keyboard-attached form */}
      <div className="fixed inset-0 z-[9999] flex items-end" onClick={handleClose}>
        <div 
          className="w-full bg-white rounded-t-xl p-6 animate-in slide-in-from-bottom-2 duration-300 shadow-lg" 
          onClick={(e) => e.stopPropagation()}
          style={{
            transform: keyboardHeight > 0 ? `translateY(-${keyboardHeight}px)` : 'none',
            transition: 'transform 0.3s ease-out'
          }}
        >
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter item title..."
                className="w-full text-base border-none outline-none bg-transparent"
                autoFocus
                ref={titleInputRef}
              />
            </div>

            {/* Conditional URL input */}
            {showUrl && (
              <div className="relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter URL (optional)..."
                  className="w-full text-base border-none outline-none bg-transparent"
                />
              </div>
            )}

            {/* Conditional Price and Source inputs */}
            {(showPrice || showSource) && (
              <div className="grid grid-cols-2 gap-4">
                {showPrice && (
                  <div className="relative">
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Price (optional)..."
                      className="w-full text-base border-none outline-none bg-transparent"
                    />
                  </div>
                )}
                {showSource && (
                  <div className="relative">
                    <input
                      type="text"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="Source (optional)..."
                      className="w-full text-base border-none outline-none bg-transparent"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Action buttons positioned at bottom of form overlay */}
          <div className="absolute bottom-6 right-6 flex items-center gap-3">
            {/* Shopping item toggle buttons */}
            <button
              type="button"
              className={`p-2 rounded-full transition-colors shadow-lg ${
                showUrl ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setShowUrl(!showUrl)}
              aria-label="Toggle URL input"
            >
              <Link className="w-4 h-4" />
            </button>
            
            <button
              type="button"
              className={`p-2 rounded-full transition-colors shadow-lg ${
                showPrice ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setShowPrice(!showPrice)}
              aria-label="Toggle price input"
            >
              <DollarSign className="w-4 h-4" />
            </button>
            
            <button
              type="button"
              className={`p-2 rounded-full transition-colors shadow-lg ${
                showSource ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setShowSource(!showSource)}
              aria-label="Toggle source input"
            >
              <MapPin className="w-4 h-4" />
            </button>
            
            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-3 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors shadow-lg"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Add button */}
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className={cn(
                "p-3 rounded-full transition-colors shadow-lg",
                title.trim() 
                  ? "bg-primary hover:bg-primary/90 text-white" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
              aria-label="Submit form"
            >
              <Check className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 