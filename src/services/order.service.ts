import { productRouter } from './../routes/product.route';
import { config } from 'dotenv';
config();
import { ObjectId, Schema } from 'mongoose';
import { Request } from 'express';

import CartModel from '../models/Cart.model';
import OrderModel from '../models/Order.model';
import ProductModel from '../models/Product.model';

class OrderService {
   getAllOrder = async (): Promise<object> => {
      try {
         const data = await OrderModel.find({});
         if (!data) throw new Error('Order not found');

         let orderCompleted: number = data.reduce((acc: any, cur: any) => {
            if (cur.status === 'completed') {
               acc += cur.total_price;
            }
            return acc;
         }, 0);

         let orderPending: number = data.reduce((acc: any, cur: any) => {
            if (cur.status === 'pending') {
               acc += cur.total_price;
            }
            return acc;
         }, 0);

         return {
            status: 'Successfully found all',
            orders: data || [],
            expectedRevenue: orderPending,
            actualRevenue: orderCompleted,
            reducedRevenue: (orderCompleted * 30) / 100,
         };
      } catch (err: any) {
         throw new Error(err);
      }
   };

   createOrder = async (
      cookies: Request['cookies'],
      data: any
   ): Promise<object> => {
      try {
         const cartId = cookies.cart;
         const cart = await CartModel.findById(cartId);
         if (!cart) throw new Error('Cart not found');
         // const oldPrice = cart.total_price;
         // let result: any;

         // const cartProduct = cart.products.map((x) => {
         //    return x;
         // });
         interface IProductOrder {
            product: ObjectId;
            quantity: number;
         }
         const cartProduct: Array<IProductOrder> = [];
         const productsPrice: Array<number> = [];
         for (let i = 0; i < cart.products.length; i++) {
            const product = await ProductModel.findById(
               cart.products[i].product
            );
            if (product.stock - cart.products[i].quantity >= 0) {
               cartProduct.push({
                  product: cart.products[i].product,
                  quantity: cart.products[i].quantity,
               });
               productsPrice.push(product.price * cart.products[i].quantity);
            }
         }
         for (let i = 0; i < cartProduct.length; i++) {
            const product = await ProductModel.findById(cartProduct[i].product);
            const stockProduct: number =
               product.stock - cartProduct[i].quantity;
            const newStock: number = stockProduct < 0 ? 0 : stockProduct;
            await ProductModel.findByIdAndUpdate(cartProduct[i].product, {
               stock: newStock,
            });
         }

         const oldPrice = productsPrice.reduce((total: any, price: any) => {
            return total + price;
         }, 0);

         const results = await OrderModel.create({
            customer: data,
            products: cartProduct,
            total_price: oldPrice,
            captcha: data.captcha,
         });
         await CartModel.findByIdAndDelete(cartId);

         return {
            status: 'Successfully create Order',
            results,
         };
      } catch (err: any) {
         console.log({ ErrorOder: err });
         throw new Error(err);
      }
   };

   deleteAOrder = async (
      id: Schema.Types.ObjectId | string
   ): Promise<object> => {
      try {
         const order = await OrderModel.findById(id);
         // let results
         if (!order) {
            throw new Error('Something went wrong! Please try again later!');
         }
         const deleteOder = await OrderModel.findByIdAndDelete(id);
         return {
            deleteOder,
         };
      } catch (err: any) {
         console.log(err);
         throw new Error(err);
      }
   };

   getAOrder = async (
      id: Schema.Types.ObjectId | string,
      data: any
   ): Promise<object> => {
      try {
         const order = await (
            await OrderModel.findById(id)
         ).populate('products.product');
         // let results
         if (!order) {
            throw new Error('Something went wrong! Please try again later!');
         }
         return {
            order,
         };
      } catch (err: any) {
         console.log(err);
         throw new Error(err);
      }
   };

   updateAOrder = async (
      id: Schema.Types.ObjectId | string,
      data: any
   ): Promise<object> => {
      try {
         const order = await OrderModel.findById(id);
         // let results
         if (!order) {
            throw new Error('Something went wrong! Please try again later!');
         }
         const updateOder = await OrderModel.findByIdAndUpdate(id, data);
         return {
            updateOder,
         };
      } catch (err: any) {
         console.log(err);
         throw new Error(err);
      }
   };

   getProductOrder = async (): Promise<object> => {
      try {
         const order = await OrderModel.find();
         // let results
         if (!order) {
            throw new Error('Something went wrong! Please try again later!');
         }
         let productOrder: Array<Object> = order.map((item) => {
            return { products: item.products };
         });

         const output: Array<Object> = productOrder.reduce(
            (acc: any, cur: any) => {
               return acc.concat(cur.products);
            },
            []
         );

         const result = [];
         const dict = [{}];

         for (const item of output) {
            const { product, quantity }: any = item;
            if (dict[product]) {
               dict[product] += quantity;
            } else {
               dict[product] = quantity;
            }
         }

         for (const product in dict) {
            if (product != '0') {
               const itemProduct = await ProductModel.findById(product);
               console.log(itemProduct);
               result.push({
                  product: itemProduct,
                  quantity: dict[product],
               });
            }
         }

         return {
            result,
         };
      } catch (err: any) {
         console.log(err);
         throw new Error(err);
      }
   };
}

export default new OrderService();
