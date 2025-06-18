import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../Components/AuthContext";
import NavBar from "../Components/Nav";
import api from "../../Axios/api";
import OrderStatusNotification from "../Components/OrderStatusNotification";
import {
  FaUser,
  FaShoppingBag,
  FaEdit,
  FaEye,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { toast } from "react-toastify";

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [userOrders, setUserOrders] = useState([]);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const { user, token, logout } = useAuth();

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
    if (activeTab === "orders") {
      fetchUserOrders();
    }
  }, [user, activeTab]);

  // Auto-refresh orders every 30 seconds when on orders tab
  useEffect(() => {
    if (activeTab === "orders" && token) {
      const interval = setInterval(() => {
        fetchUserOrders();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [activeTab, token]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Store previous orders for comparison
      setPreviousOrders(userOrders);
      setUserOrders(response.data);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // In a real app, you'd have an endpoint to update user profile
      toast.success("Profile updated successfully!");
      setEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: FaUser },
    { id: "orders", label: "My Orders", icon: FaShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center text-white text-xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-800">
                    Welcome, {user?.name || "User"}!
                  </h1>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? "border-green-500 text-green-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "profile" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Profile Information
                    </h2>
                    <button
                      onClick={() => setEditingProfile(!editingProfile)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FaEdit />
                      {editingProfile ? "Cancel" : "Edit Profile"}
                    </button>
                  </div>

                  {editingProfile ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                email: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                phone: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="+971 50 123 4567"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                          </label>
                          <input
                            type="text"
                            value={profileData.address}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                address: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Street, City, Country"
                          />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProfile(false)}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <FaUser className="text-green-600" />
                          <div>
                            <p className="text-sm text-gray-600">Full Name</p>
                            <p className="font-medium">
                              {user?.name || "Not provided"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <FaEnvelope className="text-green-600" />
                          <div>
                            <p className="text-sm text-gray-600">
                              Email Address
                            </p>
                            <p className="font-medium">
                              {user?.email || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <FaPhone className="text-green-600" />
                          <div>
                            <p className="text-sm text-gray-600">
                              Phone Number
                            </p>
                            <p className="font-medium">
                              {profileData.phone || "Not provided"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <FaMapMarkerAlt className="text-green-600" />
                          <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="font-medium">
                              {profileData.address || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "orders" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      My Orders
                    </h2>
                    <button
                      onClick={fetchUserOrders}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      🔄 Refresh
                    </button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                  ) : userOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <FaShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No orders found</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Start shopping to see your orders here!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userOrders.map((order) => (
                        <div
                          key={order._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                Order #{order._id.slice(-8)}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </div>

                          <div className="border-t pt-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-gray-600">
                                  {order.items?.length || 0} item(s)
                                </p>
                                <p className="font-medium">
                                  AED {order.total?.toFixed(2)}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowOrderModal(true);
                                }}
                                className="flex items-center gap-2 px-3 py-1 text-sm text-green-600 hover:text-green-700"
                              >
                                <FaEye />
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Order Details - #{selectedOrder._id.slice(-8)}
                </h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Order Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Order Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <strong>Order ID:</strong>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        #{selectedOrder._id.slice(-8)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <strong>Status:</strong>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          selectedOrder.status
                        )}`}
                      >
                        {selectedOrder.status.toUpperCase()}
                      </span>
                    </div>
                    <p>
                      <strong>Order Date:</strong>{" "}
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                    <p>
                      <strong>Payment Method:</strong>{" "}
                      {selectedOrder.paymentMethod?.toUpperCase() || "COD"}
                    </p>
                    <p>
                      <strong>Total Amount:</strong>{" "}
                      <span className="text-lg font-bold text-green-600">
                        AED {selectedOrder.total?.toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Delivery Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Delivery Information
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <strong>Name:</strong>{" "}
                      {selectedOrder.userInfo?.name || user?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Phone:</strong>{" "}
                      {selectedOrder.userInfo?.phone || "N/A"}
                    </p>
                    <p>
                      <strong>Address:</strong>{" "}
                      {selectedOrder.userInfo?.address || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Status Timeline */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">
                  Order Status Timeline
                </h3>
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  {[
                    "pending",
                    "confirmed",
                    "processing",
                    "shipped",
                    "delivered",
                  ].map((status, index) => {
                    const isActive =
                      [
                        "pending",
                        "confirmed",
                        "processing",
                        "shipped",
                        "delivered",
                      ].indexOf(selectedOrder.status) >= index;
                    const isCurrent = selectedOrder.status === status;
                    return (
                      <div key={status} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCurrent
                              ? "bg-green-600 text-white"
                              : isActive
                              ? "bg-green-200 text-green-800"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span
                          className={`text-xs mt-1 ${
                            isCurrent
                              ? "font-bold text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                          Product
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                          Price
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            AED {item.price?.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            AED {(item.quantity * item.price)?.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan="3"
                          className="px-4 py-2 text-sm font-medium text-gray-900 text-right"
                        >
                          Total:
                        </td>
                        <td className="px-4 py-2 text-sm font-bold text-green-600">
                          AED {selectedOrder.total?.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    fetchUserOrders(); // Refresh orders to get latest status
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Refresh Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Status Notifications */}
      <OrderStatusNotification
        orders={userOrders}
        previousOrders={previousOrders}
      />
    </div>
  );
};

export default UserDashboard;
