"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StatusPage() {
  const [loading, setLoading]     = useState(true);
  const [hasForm, setHasForm]     = useState(false);
  const [promoCode, setPromoCode] = useState(null);

  const router = useRouter();
  const API    = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
  const jwt    = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;

  useEffect(() => {
    if (!jwt) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {

        const meRes = await fetch(`${API}/api/users/me`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });

        if (!meRes.ok) throw new Error("Unauthenticated");
        const me = await meRes.json();
        const userId = me.id;

        const formsRes = await fetch(
          `${API}/api/forms` +
          `?filters[user][id][$eq]=${userId}` +
          `&sort=createdAt:DESC` +
          `&pagination[pageSize]=1`,
          { headers: { Authorization: `Bearer ${jwt}` } }
        );
        if (!formsRes.ok) {
          router.replace("/user-details");
          return;
        }
        const { data: forms = [] } = await formsRes.json();
        if (forms.length === 0) {
          router.replace("/user-details");
          return;
        }
        setHasForm(true);

        // 3️⃣ Fetch my promotions list (1 newest)
        const promosRes = await fetch(
          `${API}/api/promotions?filters[user][id][$eq]=${userId}&sort=createdAt:DESC&pagination[pageSize]=1`,
          { headers: { Authorization: `Bearer ${jwt}` } }
        );
        if (!promosRes.ok) {
          return;
        }
        const { data: promos = [] } = await promosRes.json();
        if (promos.length === 0) {
          return;
        }

        console.log("userId", userId);
        console.log("promos", promos);

        const { documentId } = promos[0];
        if (!documentId) {
          console.warn("Promotion has no documentId");
          return;
        }

        const detailRes = await fetch(
          `${API}/api/promotions/${documentId}`,
          { headers: { Authorization: `Bearer ${jwt}` } }
        );
        if (!detailRes.ok) {
          console.warn("Could not fetch promotion detail:", detailRes.status);
          return;
        }
        const detailJson = await detailRes.json();
        const promo = detailJson.data;

        const code =
          (promo.attributes && promo.attributes.promotion_code) ||
          promo.promotion_code ||
          null;
        if (code) {
          setPromoCode(code);
        }
      } catch (err) {
        console.error("StatusPage error:", err);
        if (err.message === "Unauthenticated") {
          localStorage.removeItem("jwt");
          router.replace("/login");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [API, jwt, router]);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 40 }}>Loading…</p>;
  }

  if (!hasForm) {
    router.replace("/user-details");
    return null;
  }

  if (promoCode) {
    return (
      <div style={{ maxWidth: 400, margin: "3rem auto", textAlign: "center" }}>
        <h1 style={{ marginBottom: "1rem" }}>โค้ดของคุณคือ:</h1>
        <p style={{ fontSize: 24, fontWeight: "bold" }}>{promoCode}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "3rem auto", textAlign: "center" }}>
      <h1>กรุณารอแอดมินอนุมัติแบบฟอร์มของคุณ</h1>
    </div>
  );
}