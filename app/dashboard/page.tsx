"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";

interface Group {
  id: number;
  name: string;
}

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroup, setNewGroup] = useState({ name: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch groups from Supabase
  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("groups").select("id, name");

      if (error) {
        console.error("Error fetching groups:", error);
      } else {
        setGroups(data || []);
      }
      setLoading(false);
    };

    fetchGroups();
  }, []);

  // ✅ Handle creating a new group
  const handleCreateGroup = async () => {
    if (!newGroup.name) return;

    const { data, error } = await supabase.from("groups").insert([{ name: newGroup.name }]).select();

    if (error) {
      console.error("Error creating group:", error);
    } else {
      setGroups([...groups, ...data]);
      setNewGroup({ name: "" });
      setIsModalOpen(false);
    }
  };

  // ✅ Filter groups based on search input
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Your Groups</h1>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <Input
          type="text"
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 p-3 border border-gray-300 rounded-md shadow-sm"
        />
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow-md">
              + Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="p-6 bg-white rounded-xl shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-700">Create a New Group</DialogTitle>
            </DialogHeader>
            <Input
              type="text"
              placeholder="Group Name"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ name: e.target.value })}
              className="mt-4 p-3 border border-gray-300 rounded-md shadow-sm"
            />
            <Button onClick={handleCreateGroup} className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md shadow-md">
              Save Group
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* ✅ Show Loading Indicator */}
      {loading ? (
        <p className="text-gray-600 text-center">Loading groups...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <motion.div key={group.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="p-5 bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-800">{group.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/groupExpenses?groupId=${group.id}`}>
                    <Button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md shadow-md">
                      View Group
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
