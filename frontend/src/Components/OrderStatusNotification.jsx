import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const OrderStatusNotification = ({ orders, previousOrders }) => {
  useEffect(() => {
    if (!previousOrders || !orders) return;

    // Check for status changes
    orders.forEach(currentOrder => {
      const previousOrder = previousOrders.find(prev => prev._id === currentOrder._id);
      
      if (previousOrder && previousOrder.status !== currentOrder.status) {
        // Status changed - show notification
        const statusMessages = {
          'pending': {
            icon: '⏳',
            title: 'Order Received',
            message: 'Your order is pending confirmation',
            type: 'info'
          },
          'confirmed': {
            icon: '✅',
            title: 'Order Confirmed',
            message: 'Your order has been confirmed and will be processed soon',
            type: 'success'
          },
          'processing': {
            icon: '📦',
            title: 'Order Processing',
            message: 'Your order is being carefully prepared',
            type: 'info'
          },
          'shipped': {
            icon: '🚚',
            title: 'Order Shipped',
            message: 'Your order is on its way to you',
            type: 'success'
          },
          'delivered': {
            icon: '🎉',
            title: 'Order Delivered',
            message: 'Your order has been successfully delivered',
            type: 'success'
          },
          'cancelled': {
            icon: '❌',
            title: 'Order Cancelled',
            message: 'Your order has been cancelled',
            type: 'error'
          }
        };

        const statusInfo = statusMessages[currentOrder.status] || {
          icon: '📋',
          title: 'Order Updated',
          message: `Order status updated to ${currentOrder.status}`,
          type: 'info'
        };

        const toastContent = (
          <div className="flex items-start space-x-3">
            <span className="text-2xl">{statusInfo.icon}</span>
            <div className="flex-1">
              <div className="font-semibold text-white mb-1">
                {statusInfo.title}
              </div>
              <div className="text-sm text-white/90 mb-2">
                Order #{currentOrder._id.slice(-8)}
              </div>
              <div className="text-white/80">
                {statusInfo.message}
              </div>
            </div>
          </div>
        );

        const toastMethod = statusInfo.type === 'error' ? toast.error :
                           statusInfo.type === 'success' ? toast.success :
                           toast.info;

        toastMethod(toastContent, {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: 'custom-toast',
        });
      }
    });
  }, [orders, previousOrders]);

  return null; // This component doesn't render anything
};

export default OrderStatusNotification;
