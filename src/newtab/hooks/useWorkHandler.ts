import { useState } from "react";
import { WorkService } from "../services/workService";
import type { WorkRecord } from "../types/index";
import { formatDate } from "../utils/date";

interface UseWorkHandlerProps {
  workRecords: WorkRecord[];
  setWorkRecords: (records: WorkRecord[]) => void;
}

export function useWorkHandler(props: UseWorkHandlerProps) {
  const { workRecords, setWorkRecords } = props;

  // ── 수정 모달 (WorkPanel의 ✎ 버튼용) ──
  const [isTimeEditModalOpen, setIsTimeEditModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState("");
  const [editingCheckIn, setEditingCheckIn] = useState("");
  const [editingCheckOut, setEditingCheckOut] = useState("");
  const [editingIsVacation, setEditingIsVacation] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<"none" | "annual" | "half">("none");
  const [editingExcludeLunch, setEditingExcludeLunch] = useState(false);

  const handleSaveWorkRecords = (next: WorkRecord[]) => {
    setWorkRecords(next);
    WorkService.saveWorkRecords(next);
  };

  // ── 출/퇴근 버튼 인라인 패널 저장 ──
  const handleQuickSave = (
    type: "in" | "out",
    time: string,
    leaveType: "none" | "annual" | "half",
    excludeLunch?: boolean,
  ) => {
    const today = formatDate(new Date());
    const rec = workRecords.find((r) => r.date === today);
    const isAnnual = leaveType === "annual";

    const next = WorkService.saveTimeEdit(
      workRecords,
      today,
      type === "in" ? time : (rec?.checkIn || ""),
      type === "out" ? time : (rec?.checkOut || ""),
      isAnnual,
      type === "in" ? leaveType : (rec?.leaveType || "none"),
      excludeLunch,
    );
    handleSaveWorkRecords(next);
  };

  // ── 수정 모달 (WorkPanel ✎) ──
  const handleDateEdit = (record: WorkRecord) => {
    setEditingDate(record.date);
    setEditingCheckIn(record.checkIn || "");
    setEditingCheckOut(record.checkOut || "");
    setEditingIsVacation(record.isVacation || false);
    setEditingLeaveType(record.leaveType || (record.isVacation ? "annual" : "none"));
    setEditingExcludeLunch(record.excludeLunch || false);
    setIsTimeEditModalOpen(true);
  };

  const handleSaveTimeEdit = () => {
    let next = WorkService.saveTimeEdit(
      workRecords,
      editingDate,
      editingCheckIn,
      editingCheckOut,
      editingIsVacation,
      editingLeaveType,
      editingExcludeLunch,
    );
    if (!editingCheckIn.trim() && !editingCheckOut.trim() && editingLeaveType === "none") {
      next = next.filter((r: WorkRecord) => r.date !== editingDate);
    }
    handleSaveWorkRecords(next);
    setIsTimeEditModalOpen(false);
  };

  const closeTimeEditModal = () => setIsTimeEditModalOpen(false);

  return {
    // 수정 모달
    isTimeEditModalOpen,
    editingDate,
    editingCheckIn,
    setEditingCheckIn,
    editingCheckOut,
    setEditingCheckOut,
    editingIsVacation,
    setEditingIsVacation,
    editingLeaveType,
    setEditingLeaveType,
    editingExcludeLunch,
    setEditingExcludeLunch,
    handleDateEdit,
    handleSaveTimeEdit,
    closeTimeEditModal,

    // 인라인 패널
    handleQuickSave,
  };
}
