import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send Welcome Email to Customer
 */
export const sendWelcomeEmail = async (name, email, password, role) => {
    try {
        const subject = "Welcome to Kitchen Galaxy!";
        let html = "";

        if (role === 'seller') {
            html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #ff5252;">Welcome, ${name}!</h1>
          <p>Thank you for registering as a <strong>Seller</strong> on Kitchen Galaxy.</p>
          <p>Your account is currently <strong>PENDING APPROVAL</strong>.</p>
          <p>We will review your details and you will receive another email once your account is active.</p>
          <hr/>
          <p style="font-size: 12px; color: #777;">Kitchen Galaxy Team</p>
        </div>
      `;
        } else {
            html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #ff5252;">Welcome, ${name}!</h1>
          <p>Thank you for joining Kitchen Galaxy.</p>
          <p>You can now log in and start shopping for the best kitchen appliances.</p>
          <hr/>
          <p style="font-size: 12px; color: #777;">Kitchen Galaxy Team</p>
        </div>
      `;
        }

        await transporter.sendMail({
            from: `"Kitchen Galaxy" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html,
        });
        console.log(`Welcome email sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send welcome email to ${email}:`, error);
    }
};

/**
 * Send Approval Email to Seller
 */
export const sendApprovalEmail = async (user) => {
    try {
        const subject = "🎉 Your Seller Account is ACTIVE!";
        const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #28a745;">Congratulations, ${user.name}!</h1>
        <p>Your seller account on <strong>Kitchen Galaxy</strong> has been approved by the admin.</p>
        <p>You can now log in to your dashboard and start adding products.</p>
        <br/>
        <a href="http://localhost:5173/login" style="background-color: #ff5252; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Now</a>
        <hr/>
        <p style="font-size: 12px; color: #777;">Kitchen Galaxy Team</p>
      </div>
    `;

        await transporter.sendMail({
            from: `"Kitchen Galaxy" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject,
            html,
        });
        console.log(`Approval email sent to ${user.email}`);
    } catch (error) {
        console.error(`Failed to send approval email to ${user.email}:`, error);
    }
};

/**
 * Send Rejection/Deactivation Email to Seller
 */
export const sendRejectionEmail = async (user) => {
    try {
        const subject = "⚠️ Account Status Update";
        const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #ff5252;">Hello ${user.name},</h1>
        <p>Your seller account on <strong>Kitchen Galaxy</strong> is currently <strong>INACTIVE</strong>.</p>
        <p>This may be because your application was rejected or your account was paused by an admin.</p>
        <p>Please contact support for more details.</p>
        <hr/>
        <p style="font-size: 12px; color: #777;">Kitchen Galaxy Team</p>
      </div>
    `;

        await transporter.sendMail({
            from: `"Kitchen Galaxy" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject,
            html,
        });
        console.log(`Rejection/Inactive email sent to ${user.email}`);
    } catch (error) {
        console.error(`Failed to send rejection email to ${user.email}:`, error);
    }
};

/**
 * Send Password Reset Email
 */
export const sendResetEmail = async (email, name, token) => {
    try {
        const resetLink = `http://localhost:5173/reset-password/${token}`;
        const subject = "Password Reset Request";
        const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #ff5252;">Password Reset</h1>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <br/>
        <a href="${resetLink}" style="background-color: #ff5252; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        <br/><br/>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link is valid for 1 hour.</p>
        <hr/>
        <p style="font-size: 12px; color: #777;">Kitchen Galaxy Team</p>
      </div>
    `;

        await transporter.sendMail({
            from: `"Kitchen Galaxy" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html,
        });
        console.log(`Reset email sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send reset email to ${email}:`, error);
    }
};

/**
 * Send Order Confirmation Email (Bill)
 */
export const sendOrderConfirmationEmail = async (email, name, order) => {
    try {
        const subject = `Order Confirmed - #${order._id.toString().slice(-6).toUpperCase()}`;

        const itemsHtml = order.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString()}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.qty).toLocaleString()}</td>
            </tr>
        `).join('');

        const html = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #ff5252; margin: 0;">Kitchen Galaxy</h1>
                    <p style="color: #777; font-size: 14px;">Thank you for your order!</p>
                </div>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="margin-top: 0; color: #333;">Order Summary</h3>
                    <p style="margin: 5px 0; font-size: 14px;"><strong>Order ID:</strong> #${order._id}</p>
                    <p style="margin: 5px 0; font-size: 14px;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <p style="margin: 5px 0; font-size: 14px;"><strong>Customer:</strong> ${name}</p>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #ff5252; color: white;">
                            <th style="padding: 10px; text-align: left;">Item</th>
                            <th style="padding: 10px; text-align: center;">Qty</th>
                            <th style="padding: 10px; text-align: right;">Price</th>
                            <th style="padding: 10px; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; font-size: 16px;">Grand Total:</td>
                            <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 16px; color: #ff5252;">₹${order.totalAmount.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>

                <div style="margin-bottom: 20px;">
                    <h3 style="color: #333; margin-bottom: 5px;">Shipping Address</h3>
                    <p style="margin: 0; font-size: 14px; color: #555;">${order.shippingAddress || 'Address not specified'}</p>
                </div>

                <div style="text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
                    <p style="color: #999; font-size: 12px;">If you have any questions, please contact our support.</p>
                    <p style="color: #ff5252; font-weight: bold;">© Kitchen Galaxy</p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"Kitchen Galaxy" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html,
        });
        console.log(`Order confirmation email sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send order confirmation email to ${email}:`, error);
    }
};

/**
 * Send OTP Email for Login
 */
export const sendOTPEmail = async (email, name, otp) => {
    try {
        const subject = "Your Kitchen Galaxy Login OTP";
        const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #ff5252; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">Kitchen Galaxy</h1>
        </div>
        <div style="padding: 32px; background: #fff;">
          <h2 style="color: #111; font-size: 20px; margin-top: 0;">Hi, ${name}!</h2>
          <p style="color: #555; font-size: 14px; line-height: 1.6;">Use the following OTP to log in to your account. This code is valid for <strong>5 minutes</strong>.</p>
          <div style="text-align: center; margin: 32px 0;">
            <span style="display: inline-block; background: #fff3f3; border: 2px dashed #ff5252; border-radius: 12px; padding: 16px 40px; font-size: 40px; font-weight: 900; letter-spacing: 8px; color: #ff5252;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request this, simply ignore this email.</p>
        </div>
        <div style="background: #f9f9f9; padding: 16px; text-align: center;">
          <p style="margin: 0; color: #aaa; font-size: 11px;">© Kitchen Galaxy Team</p>
        </div>
      </div>
    `;

        await transporter.sendMail({
            from: `"Kitchen Galaxy" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html,
        });
        console.log(`OTP email sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send OTP email to ${email}:`, error);
        throw error;
    }
};
/**
 * Send New Order Notification to Seller
 */
export const sendSellerNewOrderEmail = async (email, name, orderId, items) => {
    try {
        const subject = `🚀 New Order Received - #${orderId.toString().slice(-6).toUpperCase()}`;

        const itemsHtml = items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString()}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.qty).toLocaleString()}</td>
            </tr>
        `).join('');

        const html = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #ff5252; padding: 24px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900;">Kitchen Galaxy</h1>
                </div>
                
                <div style="padding: 32px; background: #fff;">
                    <h2 style="color: #111; font-size: 20px; margin-top: 0;">Hi, ${name}!</h2>
                    <p style="color: #555; font-size: 14px; line-height: 1.6;">You have received a new order. Please log in to your dashboard to process and ship the following items:</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0; font-size: 13px; color: #777;"><strong>Order ID:</strong> #${orderId}</p>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                        <thead>
                            <tr style="border-bottom: 2px solid #ff5252;">
                                <th style="padding: 12px 10px; text-align: left; font-size: 12px; color: #ff5252; text-transform: uppercase; letter-spacing: 1px;">Item</th>
                                <th style="padding: 12px 10px; text-align: center; font-size: 12px; color: #ff5252; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                                <th style="padding: 12px 10px; text-align: right; font-size: 12px; color: #ff5252; text-transform: uppercase; letter-spacing: 1px;">Price</th>
                                <th style="padding: 12px 10px; text-align: right; font-size: 12px; color: #ff5252; text-transform: uppercase; letter-spacing: 1px;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <div style="text-align: center; margin-top: 32px;">
                        <a href="http://localhost:5173/seller/orders" style="display: inline-block; background-color: #ff5252; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(255, 82, 82, 0.2);">Manage Orders</a>
                    </div>
                </div>

                <div style="background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                    <p style="margin: 0; color: #aaa; font-size: 11px;">© Kitchen Galaxy Seller Hub</p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"Kitchen Galaxy" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html,
        });
        console.log(`Seller new order notification sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send seller notification email to ${email}:`, error);
    }
};

/**
 * Send Delivery Update Email to Customer
 */
export const sendDeliveryUpdateEmail = async (email, name, order, items) => {
    try {
        const subject = `🚚 Order Update: Delivered - #${order._id.toString().slice(-6).toUpperCase()}`;

        const itemsHtml = items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString()}</td>
            </tr>
        `).join('');

        const html = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #ff5252; padding: 24px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900;">Kitchen Galaxy</h1>
                </div>
                
                <div style="padding: 32px; background: #fff;">
                    <h2 style="color: #111; font-size: 20px; margin-top: 0;">Great news, ${name}!</h2>
                    <p style="color: #555; font-size: 14px; line-height: 1.6;">Your order has been marked as <strong>DELIVERED</strong> by the seller. You can expect your package to arrive at your doorstep within the next <strong>2-3 days</strong>.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0; font-size: 13px; color: #777;"><strong>Order ID:</strong> #${order._id}</p>
                        <p style="margin: 5px 0; font-size: 13px; color: #777;"><strong>Total Amount:</strong> ₹${order.totalAmount.toLocaleString()}</p>
                    </div>

                    <h3 style="color: #333; font-size: 16px; margin-bottom: 10px;">Item Details</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                        <thead>
                            <tr style="border-bottom: 2px solid #ff5252;">
                                <th style="padding: 12px 10px; text-align: left; font-size: 11px; color: #ff5252; text-transform: uppercase;">Item</th>
                                <th style="padding: 12px 10px; text-align: center; font-size: 11px; color: #ff5252; text-transform: uppercase;">Qty</th>
                                <th style="padding: 12px 10px; text-align: right; font-size: 11px; color: #ff5252; text-transform: uppercase;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <div style="background-color: #fff8f8; border-left: 4px solid #ff5252; padding: 15px; margin-bottom: 25px;">
                        <p style="margin: 0; font-size: 13px; color: #d32f2f;"><strong>Note:</strong> Your official invoice is now available for download in your Customer Dashboard under 'My Orders'.</p>
                    </div>

                    <div style="text-align: center;">
                        <a href="http://localhost:5173/customer/orders" style="display: inline-block; background-color: #ff5252; color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 13px; text-transform: uppercase;">View Order History</a>
                    </div>
                </div>

                <div style="background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                    <p style="margin: 0; color: #aaa; font-size: 11px;">© Kitchen Galaxy - Premium Kitchenware</p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"Kitchen Galaxy" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html,
        });
        console.log(`Delivery update email sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send delivery update email to ${email}:`, error);
    }
};
