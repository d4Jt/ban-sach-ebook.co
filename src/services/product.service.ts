import { IProduct } from './../interfaces/interfaces.model';
import ProductModel from '../models/Product.model';
import { Schema } from 'mongoose';

class ProductService {
   getAllProducts = async (): Promise<object> => {
      try {
         const products = await ProductModel.find({});
         return products;
      } catch (err: any) {
         throw new Error(err);
      }
   };

   createAProduct = async (data: IProduct): Promise<object> => {
      try {
         const {
            name,
            description,
            introduction,
            images,
            stock,
            category,
            price,
         } = data;

         if (name === undefined || name === null)
            throw new Error('Name is required');
         if (description === undefined || description === null)
            throw new Error('Description is required');
         if (introduction === undefined || introduction === null)
            throw new Error('Introduction is required');
         if (images === undefined || images === null)
            throw new Error('Image is required');
         if (stock === undefined || stock === null)
            throw new Error('Stock is required');
         if (category === undefined || category === null)
            throw new Error('Category is required');
         if (price === undefined || price === null)
            throw new Error('Price is required');

         return {
            status: 'Create success',
            data: await ProductModel.create({
               ...data,
            }),
         };
      } catch (err: any) {
         throw new Error(err);
      }
   };

   updateAProduct = async (
      paramsId: string | Schema.Types.ObjectId,
      data: IProduct
   ): Promise<object> => {
      try {
         await ProductModel.updateOne({ _id: paramsId }, data);
         return {
            status: 'Update success',
            data: await ProductModel.findById(paramsId),
         };
      } catch (err: any) {
         throw new Error(err);
      }
   };

   deleteAProduct = async (
      paramsId: string | Schema.Types.ObjectId
   ): Promise<object> => {
      try {
         return {
            status: 'Delete success',
            data: await ProductModel.deleteOne({ _id: paramsId }),
         };
      } catch (err: any) {
         throw new Error(err);
      }
   };

   getAProduct = async (
      paramsId: string | Schema.Types.ObjectId
   ): Promise<object> => {
      try {
         const product = await ProductModel.findById(paramsId);
         if (!product) throw new Error('Product not found');
         return product;
      } catch (err: any) {
         throw new Error(err);
      }
   };

   getProductsByCategory = async (query: any): Promise<object> => {
      try {
         const { q } = query;
         const products = await ProductModel.find();
         if (!products) throw new Error('Product not found');
         let categories = products.map((x) => x.category);
         categories = categories.filter((x, i) => categories.indexOf(x) === i); // indexOf trả về vị trí (index) đầu tiên nó tìm thấy của phần tử được cung cấp từ mảng
         if (!q) {
            return categories;
         }
         console.log('k co q');
         const result = products.filter((x) => {
            return x.category
               .toLowerCase()
               .trim()
               .includes(q.toLowerCase().trim());
         });
         return result;
      } catch (err: any) {
         throw new Error(err);
      }
   };
}

export default new ProductService();
