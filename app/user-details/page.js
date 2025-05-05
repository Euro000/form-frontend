"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserDetailsPage() {
  const [email, setEmail]     = useState("");
  const [userId, setUserId]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirst] = useState("");
  const [lastName, setLast]   = useState("");
  const [phone, setPhone]     = useState("");
  const [image1, setImg1]     = useState(null);
  const [image2, setImg2]     = useState(null);

  const router  = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
  const jwt     = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;

  // 1️⃣ On mount, fetch /users/me and then check for any existing Form
  useEffect(() => {
    if (!jwt) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        // fetch current user
        const meRes = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (!meRes.ok) throw new Error("Not authenticated");
        const me = await meRes.json();
        setUserId(me.id);
        setEmail(me.email);

        // fetch any form for this user
        const formsRes = await fetch(
          `${API_URL}/api/forms?filters[user][id][$eq]=${me.id}` +
          `&sort=createdAt:DESC&pagination[pageSize]=1`,
          { headers: { Authorization: `Bearer ${jwt}` } }
        );
        if (formsRes.ok) {
          const { data } = await formsRes.json();
          if (data.length > 0) {
            // found an existing submission → send straight to status
            router.replace("/status");
            return;
          }
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("jwt");
        router.replace("/login");
        return;
      } finally {
        setLoading(false);
      }
    })();
  }, [jwt, API_URL, router]);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    router.replace("/login");
  };

  const uploadOne = (file, field, formId) => {
    const fd = new FormData();
    fd.append("files", file);
    fd.append("ref", "api::form.form");
    fd.append("refId", String(formId));
    fd.append("field", field);
    return fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: fd,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone) {
      alert("กรุณากรอกชื่อ นามสกุล และเบอร์โทรให้ครบ");
      return;
    }
    if (!image1 || !image2) {
      alert("กรุณาเลือกภาพทั้งสองด้าน");
      return;
    }

    try {
      // create the form
      const createRes = await fetch(`${API_URL}/api/forms`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            firstName,
            lastName,
            phone,
            userStatus: "wait",
          },
        }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createJson.error?.message || "สร้างแบบฟอร์มไม่สำเร็จ");
      }
      const formId = createJson.data.id;

      console.log(formId)

      // upload images
      await Promise.all([
        uploadOne(image1, "frontImage", formId),
        uploadOne(image2, "backImage",  formId),
      ]);

      // now that you've submitted, go to status
      router.replace("/status");
    } catch (err) {
      console.error(err);
      alert("Server error: " + err.message);
    }
  };

  if (loading) {
    return <p>Loading…</p>;
  }

  // Only render if no existing form was found
  return (
    <div style={{ maxWidth: 500, margin: "2rem auto" }}>
      <button onClick={handleLogout} style={{ float: "right" }}>
        ออกจากระบบ
      </button>
      <h1>ลงทะเบียนแลกโค้ด</h1>
      <p>Logged in as: {email}</p>

      <form onSubmit={handleSubmit}>
        <input
          required
          type="text"
          placeholder="ชื่อ"
          value={firstName}
          onChange={(e) => setFirst(e.target.value)}
          style={{ width: "100%", margin: "0.5rem 0" }}
        />
        <input
          required
          type="text"
          placeholder="นามสกุล"
          value={lastName}
          onChange={(e) => setLast(e.target.value)}
          style={{ width: "100%", margin: "0.5rem 0" }}
        />
        <input
          required
          type="text"
          placeholder="เบอร์โทร"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ width: "100%", margin: "0.5rem 0" }}
        />

        <label>ภาพด้านหน้า</label>
        <input
          required
          type="file"
          accept="image/*"
          onChange={(e) => setImg1(e.target.files?.[0] || null)}
          style={{ display: "block", margin: "0.5rem 0" }}
        />

        <label>ภาพด้านหลัง</label>
        <input
          required
          type="file"
          accept="image/*"
          onChange={(e) => setImg2(e.target.files?.[0] || null)}
          style={{ display: "block", margin: "0.5rem 0" }}
        />

        <button type="submit" style={{ marginTop: "1rem", width: "100%" }}>
          ส่งแบบฟอร์ม
        </button>
      </form>
    </div>
  );
}