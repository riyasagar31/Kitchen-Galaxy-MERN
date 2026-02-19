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
