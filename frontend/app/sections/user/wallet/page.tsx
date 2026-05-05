import { redirect } from "next/navigation";

const page = () => {
  redirect("/sections/user/dashboard");
};

export default page;
