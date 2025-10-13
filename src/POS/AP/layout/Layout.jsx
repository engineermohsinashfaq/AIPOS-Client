import Sidebar from "../components/Sidebar/Sidebar";
import NullPage from "../pages/NullPage";
import { Helmet } from "react-helmet";

const Layout = () => {
  return (
    <>
      <Helmet>
        <title>Admin Portal - Zubi Electronics</title>
        <meta
          name="description"
          content="This is the customer services page of zubi electronics."
        />
      </Helmet>
      <div className="flex flex-col lg:flex-row h-screen text-white relative">
        {/* Sidebar */}
        <div className="order-2 lg:order-1">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 order-1 lg:order-2 mt-[75px] lg:mt-0 scrollbar-hide">
          <NullPage />
        </main>
      </div>
    </>
  );
};

export default Layout;
