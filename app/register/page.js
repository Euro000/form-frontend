"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { strapiRegister } from "@/lib/strapi";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");


  const router = useRouter();

  async function handleRegister(e) {
    e.preventDefault();

    if (password !== confirmPass) {
      alert("รหัสผ่านไม่ตรงกัน!");
      return;
    }

    try {
      const { jwt } = await strapiRegister({
        username: email,
        email,
        password,
      });

      localStorage.setItem("jwt", jwt);
      alert("สมัครสมาชิกสำเร็จ!");
      router.push("/user-details");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="container max-w-md mx-auto space-y-4 py-6">
      <h1 className="text-2xl font-semibold">สมัครสมาชิก</h1>

      <form onSubmit={handleRegister} className="flex flex-col gap-3">
        <input
          required
          type="email"
          placeholder="อีเมล"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          required
          type="password"
          placeholder="รหัสผ่าน"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <input
          required
          type="password"
          placeholder="ยืนยันรหัสผ่าน"
          value={confirmPass}
          onChange={e => setConfirmPass(e.target.value)}
        />

        <button className="border rounded py-2">ลงทะเบียน</button>
      </form>

      <p>
        มีบัญชีอยู่แล้ว?{" "}
        <a className="text-blue-600" href="/login">
          เข้าสู่ระบบ
        </a>
      </p>
    </div>
  );
}