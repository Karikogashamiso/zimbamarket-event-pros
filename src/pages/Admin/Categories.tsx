import { Helmet } from "react-helmet-async";
import CategoriesManager from "@/components/Admin/CategoriesManager";

export default function AdminCategories() {
  return (
    <>
      <Helmet>
        <title>Manage Categories | Admin Panel</title>
      </Helmet>
      <CategoriesManager />
    </>
  );
}
