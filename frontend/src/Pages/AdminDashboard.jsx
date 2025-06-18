import React, { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom"; // ✅ Import navigate

const AdminDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // ✅ Hook for navigation

  const openInventoryModal = () => setIsOpen(true);
  const closeInventoryModal = () => setIsOpen(false);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <div
          onClick={openInventoryModal}
          className="bg-white p-4 rounded shadow hover:shadow-lg cursor-pointer"
        >
          <h2 className="font-semibold text-lg mb-2">📦 Manage Inventory</h2>
          <p className="text-sm">View, add, edit, or remove products.</p>
        </div>
        <div
          onClick={() => navigate("/admin/orders")}
          className="bg-white p-4 rounded shadow hover:shadow-lg cursor-pointer"
        >
          <h2 className="font-semibold text-lg mb-2">🛒 Orders</h2>
          <p className="text-sm">Track and manage customer orders.</p>
        </div>
        <div
          onClick={() => navigate("/admin/users")}
          className="bg-white p-4 rounded shadow hover:shadow-lg cursor-pointer"
        >
          <h2 className="font-semibold text-lg mb-2">👥 Users</h2>
          <p className="text-sm">View all registered users.</p>
        </div>
      </div>

      {/* Inventory Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={closeInventoryModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Manage Inventory
                  </Dialog.Title>
                  <div className="mt-4 flex flex-col gap-4">
                    <button
                      onClick={() => {
                        closeInventoryModal();
                        navigate("/admin/categories"); // ✅ Navigate here
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      ➕ Manage Categories
                    </button>
                    <button
                      onClick={() => {
                        closeInventoryModal();
                        navigate("/admin/products"); // ✅ Hook up later
                      }}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      📦 Manage Products
                    </button>
                    <button
                      onClick={() => {
                        closeInventoryModal();
                        navigate("/admin/orders");
                      }}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      📋 Manage Orders
                    </button>
                    <button
                      onClick={() => {
                        closeInventoryModal();
                        navigate("/admin/users");
                      }}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      👥 Manage Users
                    </button>
                    <button
                      onClick={closeInventoryModal}
                      className="w-full mt-2 text-gray-500 hover:text-red-500 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default AdminDashboard;
