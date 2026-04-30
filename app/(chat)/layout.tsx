import ChatIconRail from '@/components/sidebar/ChatIconRail';
import ChatSidebar from '@/components/sidebar/ChatSidebar';
import ChatNavbar from '@/components/navbar/ChatNavbar';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Far-left icon rail — always visible */}
      <ChatIconRail />

      {/* Collapsible chat list sidebar */}
      <ChatSidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 bg-white">
        <ChatNavbar />
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
