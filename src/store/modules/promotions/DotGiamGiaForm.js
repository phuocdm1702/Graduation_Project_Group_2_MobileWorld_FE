import axios from "axios";
import { onMounted, ref, watch, computed } from "vue";
import { debounce } from "lodash";
import { useRoute, useRouter } from 'vue-router';

window.handleCheckboxChange = function (id) {
    const { fetchCTSPData } = useDotGiamGiaInstance || {};
    if (fetchCTSPData) fetchCTSPData(id);
};

window.handleCheckboxChangeCTSP = function (id, isChecked) {
    const { ctspList } = useDotGiamGiaInstance || {};
    if (ctspList) {
        ctspList.value = ctspList.value.map(item => {
            if (item.ctsp.id === id) {
                return { ...item, selected: isChecked };
            }
            return item;
        });
    }
};

let useDotGiamGiaInstance = null;

export const useDotGiamGia = () => {
    const route = useRoute();
    const router = useRouter();

    const dspList = ref([]);
    const ctspList = ref([]);
    const searchKeyword = ref("");
    const idDSPs = ref([]);
    const selectedDongSanPham = ref(null);
    const selectedBoNhoTrong = ref(null);
    const selectedMauSac = ref(null);
    const selectedHeDieuHanh = ref(null);
    const selectedNhaSanXuat = ref(null);
    const heDieuHanhList = ref([]);
    const nhaSanXuatList = ref([]);

    const currentPageDSP = ref(0);
    const pageSizeDSP = ref(12);
    const totalPagesDSP = ref(0);
    const currentPageCTSP = ref(0);
    const pageSizeCTSP = ref(10);
    const totalPagesCTSP = ref(0);
    const ctspIdsInDotGiamGia = ref([]);
    const isLoading = ref(false);

    const toast = ref(null);

    const dotGiamGia = ref({
        id: null,
        ma: "",
        tenDotGiamGia: "",
        loaiGiamGiaApDung: "",
        giaTriGiamGia: 0,
        soTienGiamToiDa: 0,
        ngayBatDau: "",
        ngayKetThuc: "",
        trangThai: false,
        deleted: false
    });

    const edit = ref(false);

    const capNhatGiaSauKhiGiam = () => {
        const loaiGiamGia = dotGiamGia.value.loaiGiamGiaApDung;
        const giaTriGiam = parseFloat(dotGiamGia.value.giaTriGiamGia) || 0;
        const soTienGiamToiDa = parseFloat(dotGiamGia.value.soTienGiamToiDa) || Infinity;

        ctspList.value.forEach((product) => {
            const giaBanDau = parseFloat(product.ctsp.giaBan) || 0;
            let giaSauGiam = giaBanDau;

            if (loaiGiamGia === "Tiền mặt") {
                giaSauGiam = giaBanDau - soTienGiamToiDa;
            } else if (loaiGiamGia === "Phần trăm") {
                const soTienGiam = giaBanDau * (giaTriGiam / 100);
                giaSauGiam = giaBanDau - Math.min(soTienGiam, soTienGiamToiDa);
            }

            product.giaSauKhiGiam = giaSauGiam >= 0 ? giaSauGiam : 0;
        });
    };

    const changePageDSP = (page) => {
        if (page >= 0 && page < totalPagesDSP.value) {
            currentPageDSP.value = page;
            fetchData();
        }
    };

    const changePageCTSP = (page) => {
        if (page >= 0 && page < totalPagesCTSP.value) {
            currentPageCTSP.value = page;
            fetchData();
        }
    };

    const displayedPagesDSP = computed(() => {
        const maxPagesToShow = 5;
        const half = Math.floor(maxPagesToShow / 2);
        let start = Math.max(1, currentPageDSP.value + 1 - half);
        let end = Math.min(totalPagesDSP.value, start + maxPagesToShow - 1);
        start = Math.max(1, end - maxPagesToShow + 1);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    });

    const displayedPagesCTSP = computed(() => {
        const maxPagesToShow = 5;
        const half = Math.floor(maxPagesToShow / 2);
        let start = Math.max(1, currentPageCTSP.value + 1 - half);
        let end = Math.min(totalPagesCTSP.value, start + maxPagesToShow - 1);
        start = Math.max(1, end - maxPagesToShow + 1);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    });

    const fetchData = async () => {
        isLoading.value = true;
        try {
            const res = await axios.post(
                "/api/dotGiamGia/form",
                {
                    keyword: searchKeyword.value,
                    idDSPs: idDSPs.value.length ? idDSPs.value : [],
                    idBoNhoTrongs: selectedBoNhoTrong.value ? [selectedBoNhoTrong.value] : null,
                    idHeDieuHanh: selectedHeDieuHanh.value ? [selectedHeDieuHanh.value] : null,
                    idNhaSanXuat: selectedNhaSanXuat.value ? [selectedNhaSanXuat.value] : null,
                },
                {
                    params: {
                        pageDSP: currentPageDSP.value,
                        sizeDSP: pageSizeDSP.value,
                        pageCTSP: currentPageCTSP.value,
                        sizeCTSP: pageSizeCTSP.value
                    }
                }
            );

            dspList.value = res.data.spList || [];
            const uniqueCtspList = [];
            const seenIds = new Set();
            const selectedIds = new Set(ctspList.value.filter(item => item.selected).map(item => item.ctsp.id));

            (res.data.ctspList || []).forEach(item => {
                if (!seenIds.has(item.ctsp.id)) {
                    seenIds.add(item.ctsp.id);
                    const isSelected = selectedIds.has(item.ctsp.id) || ctspIdsInDotGiamGia.value.includes(item.ctsp.id);
                    uniqueCtspList.push({ ...item, selected: isSelected });
                }
            });
            ctspList.value = uniqueCtspList;

            heDieuHanhList.value = res.data.heDieuHanhList || [];
            nhaSanXuatList.value = res.data.nhaSanXuatList || [];

            totalPagesDSP.value = res.data.totalPages || 0;
            totalPagesCTSP.value = res.data.totalPagesCTSP || 0;

            if (currentPageDSP.value >= totalPagesDSP.value && totalPagesDSP.value > 0) {
                currentPageDSP.value = totalPagesDSP.value - 1;
                fetchData();
            }
            if (currentPageCTSP.value >= totalPagesCTSP.value && totalPagesCTSP.value > 0) {
                currentPageCTSP.value = totalPagesCTSP.value - 1;
                fetchData();
            }
            capNhatGiaSauKhiGiam();

        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            toast.value?.addToast({ type: 'error', message: 'Lỗi khi tải dữ liệu', duration: 3000 });
        } finally {
            isLoading.value = false;
        }
    };

    const fetchCTSPData = (id) => {
        if (!id || isNaN(id)) {
            console.warn("ID sản phẩm không hợp lệ:", id);
            return;
        }
        if (idDSPs.value.includes(id)) {
            idDSPs.value = idDSPs.value.filter(dspId => dspId !== id);
            ctspList.value = ctspList.value.map(item => {
                if (item.sp?.id === id) {
                    return { ...item, selected: false };
                }
                return item;
            });
        } else {
            idDSPs.value.push(Number(id));
            ctspList.value = ctspList.value.map(item => {
                if (item.sp?.id === id) {
                    return { ...item, selected: true };
                }
                return item;
            });
        }
        currentPageCTSP.value = 0;
        fetchData();
    };

    const selectAllCTSP = () => {
        ctspList.value = ctspList.value.map(item => {
            if (idDSPs.value.includes(item.sp?.id)) {
                return { ...item, selected: true };
            }
            return item;
        });
    };

    const deselectAllCTSP = () => {
        ctspList.value = ctspList.value.map(item => {
            if (idDSPs.value.includes(item.sp?.id)) {
                return { ...item, selected: false };
            }
            return item;
        });
    };

    const columns = ref([
        {
            key: "select",
            label: "",
            formatter: (value, item) => {
                return `
<input
type="checkbox"
value="${item.sp.id}"
${idDSPs.value.includes(item.sp.id) ? "checked" : ""}
onchange="handleCheckboxChange(${item.sp.id})"
/>`;
            },
        },
        { key: "index", label: "#", formatter: (_, __, index) => index + 1 },
        { key: "sp.ma", label: "Mã" },
        { key: "sp.tenSanPham", label: "Tên sản phẩm" },
        { key: "nsx.nhaSanXuat", label: "Hãng" },
        { key: "soLuongCTSP", label: "Số lượng" },
    ]);

    const getNestedValue = (obj, key) => {
        if (key === "index") return null;
        return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : 'N/A'), obj);
    };

    const columns2 = ref([
        {
            key: "select",
            label: "",
            formatter: (value, item) => {
                return `
<input
type="checkbox"
value="${item.ctsp.id}"
${item.selected ? "checked" : ""}
onchange="handleCheckboxChangeCTSP(${item.ctsp.id}, this.checked)"
/>`;
            },
        },
        {
            key: "index",
            label: "#",
            formatter: (_, __, index) => index + 1,
        },
        {
            key: "anh.duongDan",
            label: "Ảnh",
            formatter: (value) => value ? `<img src="${value}" alt="Ảnh" class="w-10 h-10 object-cover">` : "N/A",
        },
        {
            key: "soLuongTrongDotGiamGiaKhac",
            label: "Số lượng trùng",
            formatter: (value, item) => item.soLuongTrongDotGiamGiaKhac !== undefined ? item.soLuongTrongDotGiamGiaKhac : "0",
        },
        {
            key: "sp.tenSanPham_va_MauSac",
            label: "Sản phẩm & Màu sắc",
            formatter: (value, item) => {
                const tenSanPham = item.sp?.tenSanPham ?? "Chưa có dữ liệu";
                const mauSac = item.ctsp?.idMauSac?.mauSac ?? "Chưa có dữ liệu";
                return `${tenSanPham} - ${mauSac}`;
            }
        },
        {
            key: "bnt.dungLuongBoNhoTrong",
            label: "Bộ nhớ",
            formatter: (value) => value ?? "Chưa có dữ liệu",
        },
        {
            key: "ctsp.giaBan",
            label: "Đơn giá",
            formatter: (value) => value !== undefined ? value.toLocaleString() : "N/A",
        },
        {
            key: "giaSauKhiGiam",
            label: "Đơn giá sau giảm",
            formatter: (value) => value !== undefined ? value.toLocaleString() : "N/A",
        },
    ]);

    const getNestedValue2 = (obj, key) => {
        if (key === "index") return null;
        if (key === "soLuongTrongDotGiamGiaKhac") return obj.soLuongTrongDotGiamGiaKhac;
        return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : 'N/A'), obj);
    };

    const uniqueDongSanPhams = computed(() => {
        const unique = new Set(ctspList.value.map(ctsp => ctsp.sp.tenSanPham));
        return Array.from(unique);
    });

    const filteredBoNhoTrong = computed(() => {
        const allBoNhoTrong = ctspList.value.map(ctsp => ctsp.bnt.dungLuongBoNhoTrong);
        return [...new Set(allBoNhoTrong)];
    });

    const filteredMauSac = computed(() => {
        const allMauSac = ctspList.value.map(ctsp => ctsp.ctsp?.idMauSac?.mauSac).filter(Boolean);
        return [...new Set(allMauSac)];
    });

    const uniqueHeDieuHanh = computed(() => heDieuHanhList.value);
    const uniqueNhaSanXuat = computed(() => nhaSanXuatList.value);

    const filteredCTSPList = computed(() => {
        if (idDSPs.value.length === 0) return [];
        return ctspList.value.filter(ctsp => {
            const dspId = ctsp.sp?.id;
            const matchDSP = dspId ? idDSPs.value.includes(dspId) : false;
            const matchDongSanPham = selectedDongSanPham.value
                ? ctsp.sp?.tenSanPham === selectedDongSanPham.value
                : true;
            const matchBoNhoTrong = selectedBoNhoTrong.value
                ? ctsp.bnt?.dungLuongBoNhoTrong === selectedBoNhoTrong.value
                : true;
            const matchMauSac = selectedMauSac.value
                ? ctsp.ctsp?.idMauSac?.mauSac === selectedMauSac.value
                : true;
            return matchDSP && matchDongSanPham && matchBoNhoTrong && matchMauSac;
        });
    });

    const checkDuplicate = async (field, value, excludeId = null) => {
        try {
            const { data } = await axios.get(`http://localhost:8080/dot_giam_gia/ViewAddDotGiamGia/exists/${field}`, {
                params: { [field]: value, excludeId },
            });
            return data;
        } catch (error) {
            console.error("Error calling API:", error);
            toast.value?.addToast({ type: 'error', message: 'Lỗi khi kiểm tra trùng lặp', duration: 3000 });
            return false;
        }
    };

    const validate = async function () {
        const today = new Date().toISOString().split("T")[0];
        if (dotGiamGia.value.tenDotGiamGia === "") {
            toast.value?.addToast({ type: 'error', message: 'Vui lòng nhập tên đợt giảm giá', duration: 3000 });
            return false;
        }
        const isDuplicateTen = await checkDuplicate('tenDotGiamGia', dotGiamGia.value.tenDotGiamGia, dotGiamGia.value.id);
        if (isDuplicateTen) {
            toast.value?.addToast({ type: 'error', message: 'Tên đợt giảm giá đã tồn tại', duration: 3000 });
            return false;
        }
        if (dotGiamGia.value.loaiGiamGiaApDung === "") {
            toast.value?.addToast({ type: 'error', message: 'Vui lòng chọn loại giảm giá', duration: 3000 });
            return false;
        }
        if (dotGiamGia.value.giaTriGiamGia === 0 && dotGiamGia.value.loaiGiamGiaApDung !== "Tiền mặt") {
            toast.value?.addToast({ type: 'error', message: 'Vui lòng nhập giá trị giảm giá', duration: 3000 });
            return false;
        }
        if (!dotGiamGia.value.soTienGiamToiDa || dotGiamGia.value.soTienGiamToiDa <= 0) {
            toast.value?.addToast({ type: 'error', message: 'Số tiền giảm tối đa phải lớn hơn 0', duration: 3000 });
            return false;
        }
        if (dotGiamGia.value.ngayBatDau === "") {
            toast.value?.addToast({ type: 'error', message: 'Vui lòng chọn ngày bắt đầu', duration: 3000 });
            return false;
        }
        if (dotGiamGia.value.ngayBatDau < today) {
            toast.value?.addToast({
                type: 'error',
                message: 'Ngày bắt đầu không được nhỏ hơn ngày hiện tại',
                duration: 3000
            });
            return false;
        }
        if (dotGiamGia.value.ngayKetThuc === "" || dotGiamGia.value.ngayKetThuc < dotGiamGia.value.ngayBatDau) {
            toast.value?.addToast({ type: 'error', message: 'Vui lòng chọn lại ngày kết thúc', duration: 3000 });
            return false;
        }
        if (idDSPs.value.length === 0) {
            toast.value?.addToast({
                type: 'error',
                message: 'Vui lòng chọn dòng sản phẩm trong đợt giảm giá',
                duration: 3000
            });
            return false;
        }
        return true;
    };

    const fetchDongSanPham = async () => {
        try {
            const response = await axios.get(`/api/dotGiamGia/viewUpdate?id=${dotGiamGia.value.id}`);
            idDSPs.value = response.data.dspList.map(dsp => dsp.id);
            ctspIdsInDotGiamGia.value = response.data.ctspIds || [];
            fetchData();
        } catch (error) {
            console.error("Lỗi khi lấy danh sách dòng sản phẩm:", error);
            toast.value?.addToast({ type: 'error', message: 'Lỗi khi tải danh sách dòng sản phẩm', duration: 3000 });
        }
    };

    const resetForm = () => {
        dotGiamGia.value = {
            id: null,
            ma: "",
            tenDotGiamGia: "",
            loaiGiamGiaApDung: "",
            giaTriGiamGia: 0,
            soTienGiamToiDa: 0,
            ngayBatDau: "",
            ngayKetThuc: "",
            trangThai: false,
            deleted: false
        };
        edit.value = false;
        idDSPs.value = [];
        selectedDongSanPham.value = null;
        selectedBoNhoTrong.value = null;
    };

    const addData = async () => {
        const requestData = {
            dotGiamGia: dotGiamGia.value,
            idDSPs: idDSPs.value.filter(id => id && !isNaN(id)),
            ctspList: ctspList.value.filter(item => item.selected && item.ctsp?.id),
        };
        const isValid = await validate();
        if (isValid) {
            try {
                const toastId = toast.value?.addToast({ type: 'info', message: 'Đang xử lý...', isLoading: true });
                if (edit.value) {
                    await axios.put(
                        `/api/dotGiamGia/AddDotGiamGia/${dotGiamGia.value.id}`,
                        requestData,
                        { headers: { "Content-Type": "application/json" } }
                    );
                    toast.value?.removeToast(toastId);
                    toast.value?.addToast({ type: 'success', message: 'Cập nhật thành công', duration: 3000 });
                    resetForm();
                } else {
                    await axios.post(
                        "/api/dotGiamGia/AddDotGiamGia",
                        requestData,
                        { headers: { "Content-Type": "application/json" } }
                    );
                    toast.value?.removeToast(toastId);
                    toast.value?.addToast({ type: 'success', message: 'Thêm thành công', duration: 3000 });
                    resetForm();
                }

                await new Promise(resolve => setTimeout(resolve, 3000));
                router.push('/dotGiamGia');
            } catch (error) {
                console.error("Lỗi:", error);
                toast.value?.addToast({ type: 'error', message: 'Thao tác thất bại!', duration: 3000 });
            }
        }
    };

    const formatDateLocal = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };

    watch([selectedDongSanPham, selectedBoNhoTrong, selectedMauSac, selectedHeDieuHanh, selectedNhaSanXuat], () => {
        currentPageDSP.value = 0;
        currentPageCTSP.value = 0;
        fetchData();
    });

    watch(
        () => [
            dotGiamGia.value.loaiGiamGiaApDung,
            dotGiamGia.value.giaTriGiamGia,
            dotGiamGia.value.soTienGiamToiDa,
            ctspList.value
        ],
        () => {
            capNhatGiaSauKhiGiam();
        },
        { deep: true }
    );

    watch(
        () => route.query,
        (newQuery) => {
            if (newQuery.id) {
                edit.value = true;
                dotGiamGia.value = {
                    id: newQuery.id,
                    ma: newQuery.ma || "",
                    tenDotGiamGia: newQuery.tenDotGiamGia || "",
                    loaiGiamGiaApDung: newQuery.loaiGiamGiaApDung || "",
                    giaTriGiamGia: newQuery.giaTriGiamGia || 0.0,
                    soTienGiamToiDa: newQuery.soTienGiamToiDa || "",
                    ngayBatDau: newQuery.ngayBatDau ? formatDateLocal(newQuery.ngayBatDau) : "",
                    ngayKetThuc: newQuery.ngayKetThuc ? formatDateLocal(newQuery.ngayKetThuc) : "",
                    trangThai: newQuery.trangThai || "",
                };
                fetchDongSanPham();
            }
        },
        { immediate: true }
    );

    watch(selectedDongSanPham, () => {
        currentPageCTSP.value = 0;
        fetchData();
    });

    watch(searchKeyword, debounce(() => {
        currentPageDSP.value = 0;
        fetchData();
    }, 500));

    watch(idDSPs, () => {
        currentPageCTSP.value = 0;
        fetchData();
    });

    watch(() => dotGiamGia.value.loaiGiamGiaApDung, (newVal) => {
        if (newVal === 'Tiền mặt') {
            dotGiamGia.value.giaTriGiamGia = 0.0;
        }
    });

    onMounted(() => {
        fetchData();
    });

    useDotGiamGiaInstance = {
        toast,
        currentPageDSP,
        changePageDSP,
        pageSizeDSP,
        totalPagesDSP,
        currentPageCTSP,
        changePageCTSP,
        pageSizeCTSP,
        totalPagesCTSP,
        dspList,
        ctspList,
        searchKeyword,
        idDSPs,
        selectedDongSanPham,
        selectedBoNhoTrong,
        selectedMauSac,
        selectedHeDieuHanh,
        selectedNhaSanXuat,
        heDieuHanhList,
        nhaSanXuatList,
        dotGiamGia,
        edit,
        uniqueDongSanPhams,
        filteredBoNhoTrong,
        filteredCTSPList,
        filteredMauSac,
        uniqueHeDieuHanh,
        uniqueNhaSanXuat,
        addData,
        resetForm,
        columns,
        getNestedValue,
        columns2,
        getNestedValue2,
        fetchCTSPData,
        displayedPagesDSP,
        displayedPagesCTSP,
        ctspIdsInDotGiamGia,
        fetchDongSanPham,
        selectAllCTSP,
        deselectAllCTSP,
        fetchData,
        isLoading,
    };

    return useDotGiamGiaInstance;
};