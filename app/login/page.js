"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { strapiLogin } from "@/lib/strapi";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

  async function handleLogin(e) {
    e.preventDefault();

    try {
      // 1️⃣ Authenticate and store JWT
      const { jwt } = await strapiLogin(email, password);
      localStorage.setItem("jwt", jwt);
      console.log(jwt)


      // 2️⃣ Get current user
      const meRes = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!meRes.ok) throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
      const me = await meRes.json();
      const userId = me.id;

      const formsRes = await fetch(
        `${API_URL}/api/forms?filters[user][id][$eq]=${userId}&pagination[page]=1&pagination[pageSize]=1`,
        { headers: { Authorization: `Bearer ${jwt}` } }
      );

      const hasForm =
        formsRes.ok && (await formsRes.json()).data.length > 0;
      console.log("hasForm", hasForm);

      alert("เข้าสู่ระบบสำเร็จ!");
      if (hasForm) {
        router.replace("/user-details");
      } else {
        router.replace("/user-details");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
  }

  return (
    <div className="container max-w-md mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-4">เข้าสู่ระบบ</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          required
          type="email"
          placeholder="อีเมล"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          required
          type="password"
          placeholder="รหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded"
        >
          เข้าสู่ระบบ
        </button>
      </form>
      <p className="mt-4 text-center">
        ไม่มีบัญชี?{" "}
        <a className="text-blue-600 underline" href="/register">
          สมัครสมาชิก
        </a>
      </p>
    </div>
  );
}