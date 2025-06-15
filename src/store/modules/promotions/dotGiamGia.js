import axios from "axios";
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";


export function useDiscountManagement() {
    const toast = ref(null);
    const router = useRouter();
    const currentPage = ref(0);
    const pageSize = ref(10);
    const totalPages = ref(0);

    // Tìm kiếm
    const searchQuery = ref("");
    const filterType = ref("");
    const filterStatus = ref("");
    const startDate = ref("");
    const endDate = ref("");
    const minOrder = ref(null);
    const saleValue = ref("");
    const deleted = ref("");

    // Confirm Modal
    const showConfirmModal = ref(false);
    const confirmMessage = ref("");
    const executeConfirmedAction = ref(() => {});

    const closeConfirmModal = () => {
        showConfirmModal.value = false;
        confirmMessage.value = "";
        executeConfirmedAction.value = () => {};
    };

    const isModalOpen = ref(false);
    const openModal = () => {
        isModalOpen.value = true;
    };

    const dataTable = ref([]);

    const dotGiamGia = ref({
        id: null,
        ma: "",
        tenDotGiamGia: "",
        loaiGiamGiaApDung: "",
        giaTriGiamGia: "",
        soTienGiamToiDa: "",
        ngayBatDau: "",
        ngayKetThuc: "",
        trangThai: "",
        deleted: "",
    });

    const changePage = (page) => {
        currentPage.value = page;
        fetchData();
    };

    const fetchData = async () => {
        try {
            const params = {
                page: currentPage.value,
                size: pageSize.value,
                maDGG: searchQuery.value || null,
                tenDGG: searchQuery.value || null,
                loaiGiamGiaApDung: filterType.value ? filterType.value.toLowerCase() : null,
                giaTriGiamGia: saleValue.value && !isNaN(Number(saleValue.value)) ? Number(saleValue.value).toFixed(2) : null,
                soTienGiamToiDa: minOrder.value && !isNaN(Number(minOrder.value)) ? Number(minOrder.value) : null,
                ngayBatDau: startDate.value || null,
                ngayKetThuc: endDate.value || null,
                trangThai: filterStatus.value === "0" ? false : filterStatus.value === "1" ? true : null,
                deleted: filterStatus.value === "deleted" ? true : null,
            };
            console.log("Params sent:", JSON.stringify(params, null, 2));
            const res = await axios.get("/api/dotGiamGia/search", {
                params,
            });
            console.log("API Response:", JSON.stringify(res.data, null, 2));

            const processedData =
                res.data.content && res.data.content.length > 0
                    ? res.data.content.map((item) => {
                        let textColor = item.deleted
                            ? "text-red-500"
                            : item.trangThai
                                ? "text-blue-500"
                                : "text-green-500";
                        let text = item.deleted
                            ? "Đã kết thúc"
                            : item.trangThai
                                ? "Sắp diễn ra"
                                : "Đang diễn ra";

                        return {
                            ...item,
                            trangThaiFormatted: `${text}`,
                        };
                    })
                    : [];

            dataTable.value = processedData;
            totalPages.value = res.data.totalPages || 0;
        } catch (error) {
            console.error("Lỗi:", error.response?.data || error.message);
            if (toast.value) {
                toast.value.addToast({ type: "error", message: "Không thể tải dữ liệu!", duration: 3000 });
            }
        }
    };

    const toggleSaleStatus = async (sale) => {
        try {
            const newStatus = sale.trangThaiFormatted.includes("Đang diễn ra") ? true : false;
            await axios.put(`/api/dotGiamGia/${sale.id}/status`, {
trangThai: newStatus,
});
if (toast.value) {
    toast.value.addToast({ type: "success", message: `Đợt giảm giá ${sale.ma} đã được ${newStatus ? "tắt" : "kích hoạt"}!`, duration: 3000 });
}
await fetchData();
} catch (error) {
    console.error("Lỗi khi thay đổi trạng thái:", error);
    if (toast.value) {
        toast.value.addToast({ type: "error", message: "Không thể thay đổi trạng thái!", duration: 3000 });
    }
}
};

const deleteDotGiamGia = async (id) => {
    try {
        await axios.delete(`/api/dotGiamGia/${id}`);
        if (toast.value) {
            toast.value.addToast({ type: "success", message: "Xóa thành công!", duration: 3000 });
        }
        await fetchData();
    } catch (error) {
        console.error("Lỗi khi xóa đợt giảm giá:", error);
        if (toast.value) {
            toast.value.addToast({ type: "error", message: "Lỗi khi xóa đợt giảm giá!", duration: 3000 });
        }
    }
};

const viewUpdate = async (discount) => {
    try {
        let discountData = discount;
        if (typeof discount === "number" || typeof discount === "string") {
            discountData = dataTable.value.find((item) => item.id === discount);
        }

        if (!discountData) {
            throw new Error("Không tìm thấy dữ liệu");
        }

        const response = await axios.get(`/api/dotGiamGia/viewUpdate`, {
            params: { id: discountData.id },
        });

        router.push({
            path: "/dotGiamGia/form",
            query: {
                id: discountData.id,
                ma: discountData.ma || "",
                tenDotGiamGia: discountData.tenDotGiamGia || "",
                loaiGiamGiaApDung: discountData.loaiGiamGiaApDung || "",
                giaTriGiamGia: discountData.giaTriGiamGia || "",
                soTienGiamToiDa: discountData.soTienGiamToiDa || "",
                ngayBatDau: discountData.ngayBatDau || "",
                ngayKetThuc: discountData.ngayKetThuc || "",
                trangThai: discountData.trangThai !== undefined ? discountData.trangThai : "",
                dongSanPham: JSON.stringify(response.data),
            },
        });
    } catch (error) {
        console.error("Lỗi khi xem cập nhật:", error);
        if (toast.value) {
            toast.value.addToast({ type: "error", message: "Không thể tải dữ liệu cập nhật!", duration: 3000 });
        }
    }
};

const exportExcel = async () => {
    try {
        const response = await axios.get("/api/dotGiamGia/exportExcel", {
            responseType: "blob",
        });
        const blob = response.data;
        saveAs(blob, "dotGiamGia.xlsx");
        if (toast.value) {
            toast.value.addToast({ type: "success", message: "Xuất Excel thành công!", duration: 3000 });
        }
    } catch (error) {
        console.error("Lỗi khi xuất Excel:", error);
        if (toast.value) {
            toast.value.addToast({ type: "error", message: "Không thể xuất file Excel!", duration: 3000 });
        }
    }
};

const columns = ref([
    {
        key: "index",
        label: "#",
        formatter: (value, item, index) => {
            return currentPage.value * pageSize.value + (index + 1);
        },
    },
    { key: "ma", label: "Mã" },
    { key: "tenDotGiamGia", label: "Tên đợt giảm giá" },
    {
        key: "giaTriGiamGia",
        label: "Giá trị",
        formatter: (value) => value + "%",
    },
    {
        key: "soTienGiamToiDa",
        label: "Số tiền giảm tối đa",
        formatter: (value) => value ? new Intl.NumberFormat('vi-VN').format(value) : 'N/A',
    },
    {
        key: "ngayBatDau",
        label: "Ngày bắt đầu",
        formatter: (value) => new Date(value).toLocaleDateString("vi-VN"),
    },
    {
        key: "ngayKetThuc",
        label: "Ngày kết thúc",
        formatter: (value) => new Date(value).toLocaleDateString("vi-VN"),
    },
    {
        key: "trangThaiFormatted",
        label: "Trạng thái",
        formatter: (value) => value,
    },
    {
        key: "actions",
        label: "Hành động",
        formatter: (value, item) => `
                <button class="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition" data-id="${item.id}" onclick="document.dispatchEvent(new CustomEvent('deleteDotGiamGia', { detail: ${item.id} }))">
                    <i class="fa-solid fa-trash"></i>
                </button>
                <button onclick="document.dispatchEvent(new CustomEvent('viewUpdate', { detail: ${item.id} }))" class="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition">
                    <i class="fa-solid fa-edit"></i>
                </button>
            `,
    },
]);

const getNestedValue = (obj, key) => (key === "index" ? null : obj[key]);

const handleCustomEvents = () => {
    document.addEventListener("deleteDotGiamGia", (event) => {
        deleteDotGiamGia(event.detail);
    });
    document.addEventListener("viewUpdate", (event) => {
        viewUpdate(event.detail);
    });
};

onMounted(() => {
    fetchData();
    handleCustomEvents();
});

watch([
    searchQuery,
    filterType,
    filterStatus,
    startDate,
    endDate,
    minOrder,
    saleValue,
    deleted,
], () => {
    currentPage.value = 0;
    fetchData();
});

return {
    router,
    toast,
    currentPage,
    pageSize,
    totalPages,
    searchQuery,
    filterType,
    filterStatus,
    startDate,
    endDate,
    minOrder,
    saleValue,
    deleted,
    isModalOpen,
    openModal,
    dataTable,
    dotGiamGia,
    changePage,
    fetchData,
    deleteDotGiamGia,
    viewUpdate,
    toggleSaleStatus,
    columns,
    getNestedValue,
    exportExcel,
    showConfirmModal,
    confirmMessage,
    executeConfirmedAction,
    closeConfirmModal,
};
}
