import AccountSidebar from '@/components/AccountSidebar'

export const metadata = {
  title: 'Account — CraveStore',
}

export default function AccountLayout({ children }) {
  return (
    <div className="min-h-[80vh] mx-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 py-8">
        <div className="col-span-1">
          <AccountSidebar />
        </div>
        <div className="col-span-3">
          {children}
        </div>
      </div>
    </div>
  )
}
