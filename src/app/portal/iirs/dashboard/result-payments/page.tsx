"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "../../providers/AuthProvider";
import {
  getResultPaymentStats,
  ResultPaymentRecord,
  ResultPaymentStatsResponse,
} from "@/lib/iirs/dataInteraction";
import { generateResultPaymentsReportPDF } from "@/lib/iirs/pdfGenerator";
import { FaChevronLeft, FaChevronRight, FaDownload, FaFilter, FaPrint, FaTimes } from "react-icons/fa";

const DEFAULT_LIMIT = 20;

const formatCurrency = (amount: number) => {
  return `NGN ${Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const toTitleCase = (value: string) => {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const lgaMapping: Record<string, string> = {
  "A M": "Aboh Mbaise",
  "O M": "Owerri Municipal",
  "O N": "Owerri North",
};

const renderValue = (value: unknown, column?: string) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (column === "lga" && typeof value === "string") {
    return lgaMapping[value] || value;
  }

  if ((column === "amount" || column === "totalAmount") && typeof value === "number") {
    return formatCurrency(value);
  }

  if ((column === "createdAt" || column === "updatedAt" || column === "paidAt") && typeof value === "string") {
    return new Date(value).toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

export default function ResultPaymentsPage() {
  const router = useRouter();
  const { token, role, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [reportAction, setReportAction] = useState<"download" | "print" | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [examTypeInput, setExamTypeInput] = useState("");
  const [yearInput, setYearInput] = useState("");
  const [paymentStatusInput, setPaymentStatusInput] = useState("");
  const [limitInput, setLimitInput] = useState(DEFAULT_LIMIT.toString());

  const [filters, setFilters] = useState({
    examType: "",
    year: "",
    paymentStatus: "",
    page: 1,
    limit: DEFAULT_LIMIT,
  });

  const [stats, setStats] = useState<ResultPaymentStatsResponse>({
    data: [],
    total: 0,
    totalAmount: 0,
    amountByExamType: {},
    page: 1,
    limit: DEFAULT_LIMIT,
    totalPages: 0,
  });

  const tableColumns = useMemo(() => {
    if (!stats.data.length) {
      return [];
    }

    const preferredOrder: Array<keyof ResultPaymentRecord> = [
      "studentName",
      "email",
      "examNumber",
      "examType",
      "amount",
      "examYear",
      "lga",
      "schoolName",
      "paymentStatus",
      "paymentReference",
      "searchMode",
      "paidAt",
      "createdAt",
      "updatedAt",
    ];

    const firstRow = stats.data[0];
    const availableColumns = new Set(Object.keys(firstRow));

    return preferredOrder.filter((column) => availableColumns.has(column));
  }, [stats.data]);

  const fetchStats = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await getResultPaymentStats(token, {
        examType: filters.examType || undefined,
        year: filters.year || undefined,
        paymentStatus: filters.paymentStatus || undefined,
        page: String(filters.page),
        limit: String(filters.limit),
      });

      setStats(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch result payment statistics";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [filters, token]);

  useEffect(() => {
    if (!authLoading && role !== "idcl") {
      router.replace("/portal/iirs/dashboard");
      return;
    }

    if (!authLoading && role === "idcl") {
      fetchStats();
    }
  }, [authLoading, role, router, fetchStats]);

  const applyFilters = () => {
    const parsedLimit = Number(limitInput);

    setFilters({
      examType: examTypeInput.trim(),
      year: yearInput.trim(),
      paymentStatus: paymentStatusInput.trim(),
      page: 1,
      limit: Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : DEFAULT_LIMIT,
    });
  };

  const clearFilters = () => {
    setExamTypeInput("");
    setYearInput("");
    setPaymentStatusInput("");
    setLimitInput(DEFAULT_LIMIT.toString());

    setFilters({
      examType: "",
      year: "",
      paymentStatus: "",
      page: 1,
      limit: DEFAULT_LIMIT,
    });
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > stats.totalPages) {
      return;
    }

    setFilters((prev) => ({ ...prev, page }));
  };

  const getAllReportRows = async () => {
    let reportRows = stats.data;

    if (stats.totalPages > 1) {
      const pageRequests = Array.from({ length: stats.totalPages }, (_, index) =>
        getResultPaymentStats(token!, {
          examType: filters.examType || undefined,
          year: filters.year || undefined,
          paymentStatus: filters.paymentStatus || undefined,
          page: String(index + 1),
          limit: String(filters.limit),
        }),
      );

      const pages = await Promise.all(pageRequests);
      reportRows = pages.flatMap((page) => page.data);
    }

    return reportRows;
  };

  const handleReportAction = async (action: "download" | "print") => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    if (!stats.data.length) {
      toast.error("No result payment data to download");
      return;
    }

    try {
      setReportAction(action);

      const reportRows = await getAllReportRows();

      await generateResultPaymentsReportPDF(
        {
          filters: {
            examType: filters.examType || undefined,
            year: filters.year || undefined,
            paymentStatus: filters.paymentStatus || undefined,
          },
          total: stats.total,
          totalAmount: stats.totalAmount,
          amountByExamType: stats.amountByExamType,
          rows: reportRows,
        },
        action,
      );

      toast.success(
        action === "print"
          ? "Print preview opened"
          : "Result payment report downloaded",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : action === "print"
            ? "Failed to open print preview"
            : "Failed to download report";
      toast.error(message);
    } finally {
      setReportAction(null);
    }
  };

  if (authLoading || role !== "idcl") {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-3" />
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto px-4 sm:px-6 lg:px-8">
      <div className="w-full mt-6 sm:mt-8 lg:mt-10 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Result Payment Statistics</h1>
            <p className="text-sm text-gray-600 mt-1">Comprehensive analytics for result payment records.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleReportAction("download")}
              disabled={loading || reportAction !== null || stats.data.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaDownload size={14} />
              <span>{reportAction === "download" ? "Generating PDF..." : "Download PDF"}</span>
            </button>

            <button
              onClick={() => handleReportAction("print")}
              disabled={loading || reportAction !== null || stats.data.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPrint size={14} />
              <span>{reportAction === "print" ? "Preparing Print..." : "Print Report"}</span>
            </button>

            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              <FaFilter size={14} />
              <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                <input
                  value={examTypeInput}
                  onChange={(event) => setExamTypeInput(event.target.value)}
                  placeholder="FSLC, BECE..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  value={yearInput}
                  onChange={(event) => setYearInput(event.target.value)}
                  placeholder="2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <input
                  value={paymentStatusInput}
                  onChange={(event) => setPaymentStatusInput(event.target.value)}
                  placeholder="successful, pending..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
                <input
                  value={limitInput}
                  onChange={(event) => setLimitInput(event.target.value)}
                  type="number"
                  min={1}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                onClick={applyFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                <FaFilter size={12} />
                <span>Apply Filters</span>
              </button>

              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <FaTimes size={12} />
                <span>Clear</span>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-800">Total Records</p>
            <p className="text-2xl font-semibold text-green-900 mt-1">{stats.total.toLocaleString()}</p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">Total Amount</p>
            <p className="text-2xl font-semibold text-blue-900 mt-1">{formatCurrency(stats.totalAmount)}</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">Current Page</p>
            <p className="text-2xl font-semibold text-amber-900 mt-1">{stats.page}</p>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
            <p className="text-sm text-purple-800">Page Size</p>
            <p className="text-2xl font-semibold text-purple-900 mt-1">{stats.limit}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Amount by Exam Type</h2>
          </div>

          <div className="p-4 sm:p-5">
            {Object.keys(stats.amountByExamType || {}).length === 0 ? (
              <p className="text-sm text-gray-500">No exam-type breakdown found for current filters.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(stats.amountByExamType).map(([examType, breakdown]) => (
                  <div key={examType} className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{examType}</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{formatCurrency(breakdown.totalAmount)}</p>
                    <p className="text-sm text-gray-500 mt-1">{breakdown.count.toLocaleString()} payments</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Result Payments</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading payment statistics...</div>
          ) : stats.data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No result payment records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {tableColumns.map((column) => (
                      <th
                        key={column}
                        className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap"
                      >
                        {toTitleCase(column)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {stats.data.map((row, rowIndex) => (
                    <tr key={row._id ?? row.paymentReference ?? String(rowIndex)} className="hover:bg-gray-50">
                      {tableColumns.map((column) => (
                        <td key={`${rowIndex}-${column}`} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {renderValue(row[column as keyof ResultPaymentRecord], column)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Page {stats.page} of {Math.max(stats.totalPages || 1, 1)}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(stats.page - 1)}
                disabled={stats.page <= 1 || loading}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <FaChevronLeft size={12} />
                <span>Previous</span>
              </button>

              <button
                onClick={() => goToPage(stats.page + 1)}
                disabled={stats.page >= Math.max(stats.totalPages, 1) || loading}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <span>Next</span>
                <FaChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
