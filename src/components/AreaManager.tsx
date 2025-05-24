"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, contrastColor } from "@/lib/utils";
import { Area, UpdatesAccount } from "@/schema";
import { useAccount } from "jazz-react";
import { type Loaded, co } from "jazz-tools";
import { Pencil, Plus, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import { ColorPicker } from "./ColorPicker";
import { Badge } from "./ui/badge";
import { Button, buttonVariants } from "./ui/button";

export function AreaManager() {
	const [isOpen, setIsOpen] = useState(false);
	const [editingArea, setEditingArea] = useState<Loaded<typeof Area> | null>(
		null,
	);
	const [newAreaName, setNewAreaName] = useState("");
	const [newAreaColor, setNewAreaColor] = useState("#3B82F6");
	const [editAreaName, setEditAreaName] = useState("");
	const [editAreaColor, setEditAreaColor] = useState("#3B82F6");

	const { me } = useAccount(UpdatesAccount, {
		resolve: {
			root: {
				areas: { $each: true },
			},
		},
	});

	if (!me || !me.root) {
		return null;
	}

	const areas = me.root.areas || [];

	const handleAddArea = () => {
		if (!newAreaName.trim() || !me.root.areas) return;

		const newArea = Area.create({
			name: co.plainText().create(newAreaName.trim()),
			color: newAreaColor,
		});

		me.root.areas.push(newArea);
		setNewAreaName("");
		setNewAreaColor("#3B82F6");
	};

	const handleEditArea = (area: Loaded<typeof Area>) => {
		setEditingArea(area);
		setEditAreaName(area.name?.toString() || "");
		setEditAreaColor(area.color || "#3B82F6");
	};

	const handleSaveEdit = () => {
		if (!editingArea || !editAreaName.trim()) return;

		if (editingArea.name) {
			editingArea.name.applyDiff(editAreaName.trim());
		}
		editingArea.color = editAreaColor;

		setEditingArea(null);
		setEditAreaName("");
		setEditAreaColor("#3B82F6");
	};

	const handleDeleteArea = (areaToDelete: Loaded<typeof Area>) => {
		if (!me.root.areas) return;

		const index = me.root.areas.findIndex(
			(area) => area?.id === areaToDelete.id,
		);
		if (index !== -1) {
			me.root.areas.splice(index, 1);
		}
	};

	const handleCancelEdit = () => {
		setEditingArea(null);
		setEditAreaName("");
		setEditAreaColor("#3B82F6");
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger className={cn(buttonVariants({ variant: "outline" }))}>
				<Settings className="h-5 w-5 mr-2" />
				Manage Areas
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Manage Areas</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Add New Area */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<Plus className="h-5 w-5" />
								Add New Area
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="new-area-name">Area Name</Label>
									<Input
										id="new-area-name"
										placeholder="Enter area name"
										value={newAreaName}
										onChange={(e) => setNewAreaName(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label>Color</Label>
									<div className="block">
										<ColorPicker
											value={newAreaColor}
											onChange={setNewAreaColor}
											className="w-full"
										/>
									</div>
								</div>
							</div>
							<Button
								onClick={handleAddArea}
								disabled={!newAreaName.trim()}
								className="w-full"
							>
								Add Area
							</Button>
						</CardContent>
					</Card>

					{/* Existing Areas */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">
								Existing Areas ({areas.length})
							</CardTitle>
						</CardHeader>
						<CardContent>
							{areas.length === 0 ? (
								<p className="text-muted-foreground text-center py-4">
									No areas created yet
								</p>
							) : (
								<div className="space-y-3">
									{areas.map((area) => {
										if (!area) return null;

										const isEditing = editingArea?.id === area.id;

										return (
											<div
												key={area.id}
												className="flex items-center justify-between p-3 border rounded-lg"
											>
												{isEditing ? (
													<div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 mr-3">
														<Input
															value={editAreaName}
															onChange={(e) => setEditAreaName(e.target.value)}
															placeholder="Area name"
														/>
														<ColorPicker
															value={editAreaColor}
															onChange={setEditAreaColor}
														/>
													</div>
												) : (
													<div className="flex items-center gap-3 flex-1">
														<Badge
															style={{
																backgroundColor: area.color ?? "#000000",
																color: contrastColor(area.color ?? "#000000"),
															}}
														>
															{area.name || "Unnamed Area"}
														</Badge>
														<span className="text-sm text-muted-foreground">
															{area.color}
														</span>
													</div>
												)}

												<div className="flex items-center gap-2">
													{isEditing ? (
														<>
															<Button
																size="sm"
																onClick={handleSaveEdit}
																disabled={!editAreaName.trim()}
															>
																Save
															</Button>
															<Button
																size="sm"
																variant="outline"
																onClick={handleCancelEdit}
															>
																Cancel
															</Button>
														</>
													) : (
														<>
															<Button
																size="sm"
																variant="outline"
																onClick={() => handleEditArea(area)}
															>
																<Pencil className="h-4 w-4" />
															</Button>
															<Button
																size="sm"
																variant="destructive"
																onClick={() => handleDeleteArea(area)}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</>
													)}
												</div>
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</DialogContent>
		</Dialog>
	);
}
