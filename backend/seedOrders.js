const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Order = require('./models/Order');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const generateOrders = async () => {
  try {
    console.log('🧹 Deleting old orders...');
    await Order.deleteMany({}); // Clear old orders first

    console.log('🔍 Fetching products...');
    const products = await Product.find();

    if (!products.length) {
      console.warn('⚠️ No products found. Add some products first.');
      mongoose.disconnect();
      return;
    }

    const orders = [];

    for (let i = 0; i < 20; i++) {
      const itemCount = Math.floor(Math.random() * 4) + 1;
      const selectedProducts = [];
      let total = 0;

      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 5) + 1;

        selectedProducts.push({
            productId: product._id,
            name: product.name,
            image: product.images?.[0] || 'https://via.placeholder.com/150',
            quantity,
            price: product.price
          });
          

        total += product.price * quantity;
      }

      orders.push({
        
        orderItems: selectedProducts,
        totalPrice: total,
        paymentMethod: 'Credit Card',
        shippingAddress: {
          address: '123 Main St',
          city: 'Brooklyn',
          postalCode: '11201',
          country: 'USA'
        },
        user: '68194699bd4784cb43bf35f9', // Use your real user ID here
        createdAt: new Date()
      });
    }

    await Order.insertMany(orders);
    console.log(`✅ Inserted ${orders.length} dummy orders.`);
  } catch (err) {
    console.error('❌ Error generating orders:', err);
  } finally {
    mongoose.disconnect();
  }
};

generateOrders();
