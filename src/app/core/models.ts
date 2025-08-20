export interface ImageRef {
  url: string;
  publicId?: string | null;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;

  // was: string; now an object (backend accepts strings too, but we’ll use object going forward)
  image?: ImageRef | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface ProductSpec {
  key: string;
  value: string;
}

export interface Product {
  _id: string;
  name: string;
  // populated or id
  category: Category | string;

  shortDesc?: string;
  description?: string;
  specs: ProductSpec[];

  // was: string[]; now ImageRef[]
  images: ImageRef[];

  createdAt?: string;
  updatedAt?: string;
}

export interface Enquiry {
  _id: string;
  product?: Product | string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'in_progress' | 'closed';
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
}
