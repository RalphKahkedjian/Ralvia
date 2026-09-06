import { getCustomers } from "@/lib/api/customer";
import AddCustomerForm from "@/components/AddCustomerForm";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-[#14213D]">
            Customers
          </h1>

          <p className="mt-2 text-[#5B6472]">
            Manage your company&apos;s customers.
          </p>
        </div>

        <a
          href="#add-customer"
          className="rounded-md bg-[#14213D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1c2d52]"
        >
          Add new
        </a>
      </div>

      <div className="mt-8 overflow-hidden overflow-x-auto rounded-md border border-[#D8DCE3] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#D8DCE3] text-left text-[#5B6472]">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Phone</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="border-t border-[#D8DCE3] text-[#14213D] transition-colors hover:bg-[#FBFAF8]"
              >
                <td className="p-4 font-medium">
                  {customer.name}
                </td>

                <td className="p-4 text-[#5B6472]">
                  {customer.email ?? "—"}
                </td>

                <td className="p-4 text-[#5B6472]">
                  {customer.phone ?? "—"}
                </td>
              </tr>
            ))}

            {customers.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="p-6 text-center text-[#5B6472]"
                >
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        id="add-customer"
        className="customer-modal"
      >
        <a
          href="#"
          className="customer-modal-overlay"
          aria-label="Close add customer"
        />

        <div className="customer-modal-panel">
          <div className="flex items-center justify-between border-b border-[#D8DCE3] p-6">
            <h2 className="font-serif text-xl text-[#14213D]">
              Add customer
            </h2>

            <a
              href="#"
              aria-label="Close"
              className="text-lg leading-none text-[#5B6472] transition-colors hover:text-[#14213D]"
            >
              &#215;
            </a>
          </div>

          <div className="p-6">
            <AddCustomerForm />
          </div>
        </div>
      </div>

      <style>{`
        .customer-modal {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 50;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .customer-modal:target {
          display: flex;
        }

        .customer-modal-overlay {
          position: absolute;
          inset: 0;
          background: rgba(20, 33, 61, 0.5);
        }

        .customer-modal-panel {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 32rem;
          max-height: 85vh;
          overflow-y: auto;
          border-radius: 0.5rem;
          background: #ffffff;
        }
      `}</style>
    </>
  );
}