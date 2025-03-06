"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Expense {
  id: number;
  name: string;
  amount: number;
}

export default function GroupExpenses() {
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId");
  const [groupName, setGroupName] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState({ name: "", amount: "" });

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) return;
      const { data, error } = await supabase.from("groups").select("name").eq("id", groupId).single();
      if (error) console.error("Error fetching group:", error);
      else setGroupName(data?.name || "Unknown Group");
    };

    const fetchExpenses = async () => {
      if (!groupId) return;
      const { data, error } = await supabase.from("expenses").select("id, name, amount").eq("group_id", groupId);
      if (error) console.error("Error fetching expenses:", error);
      else setExpenses(data || []);
    };

    fetchGroupDetails();
    fetchExpenses();
  }, [groupId]);

  const handleAddExpense = async () => {
    if (!newExpense.name || !newExpense.amount || !groupId) return;

    const { data, error } = await supabase.from("expenses").insert([
      { name: newExpense.name, amount: parseFloat(newExpense.amount), group_id: parseInt(groupId) },
    ]).select();

    if (error) {
      console.error("Error adding expense:", error);
    } else {
      setExpenses([...expenses, ...data]);
      setNewExpense({ name: "", amount: "" });
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <Link href="/dashboard">
        <Button className="mb-4">← Back to Dashboard</Button>
      </Link>

      <h1 className="text-3xl font-bold mb-4">{groupName} - Expenses</h1>

      <Card className="p-4">
        <CardHeader>
          <CardTitle>Add New Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Expense Name"
            value={newExpense.name}
            onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
            className="mt-2"
          />
          <Input
            type="number"
            placeholder="Amount"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            className="mt-2"
          />
          <Button onClick={handleAddExpense} className="mt-4 w-full">Save Expense</Button>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mt-6">Expense List</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {expenses.map((expense) => (
          <Card key={expense.id} className="p-4">
            <CardContent>
              <p className="text-xl font-semibold">{expense.name}</p>
              <p className="text-gray-600">${expense.amount.toFixed(2)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
