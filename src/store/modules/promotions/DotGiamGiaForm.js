import axios from "axios";
import {onMounted, ref, watch, computed} from "vue";
import {debounce} from "lodash";
import {useRoute, useRouter} from 'vue-router';

window.handleCheckboxChange = function (id) {
    const {fetchCTSPData} = useDotGiamGiaInstance || {};
    if (fetchCTSPData) fetchCTSPData(id);
};

window.handleCheckboxChangeCTSP = function (id, isChecked) {
    const {ctspList} = useDotGiamGiaInstance || {};
    if (ctspList) {
        ctspList.value = ctspList.value.map(item => {
            if (item.ctsp.id === id) {
                return {...item, selected: isChecked};
            }
            return item;
        });
    }
};

let useDotGiamGiaInstance = null;

export const useDotGiamGia = (toastNotification) => {
    const route = useRoute();
    const router = useRouter();

    const dspList = ref([]);
    const ctspList = ref([]);
    const searchKeyword = ref("");
    const idDSPs = ref([]);
    const selectedCTSPIds = ref([]);
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

    const toast = toastNotification; // Gán toastNotification cho toast

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
        return Array.from({length: end - start + 1}, (_, i) => start + i);
    });

    const displayedPagesCTSP = computed(() => {
        const maxPagesToShow = 5;
        const half = Math.floor(maxPagesToShow / 2);
        let start = Math.max(1, currentPageCTSP.value + 1 - half);
        let end = Math.min(totalPagesCTSP.value, start + maxPagesToShow - 1);
        start = Math.max(1, end - maxPagesToShow + 1);
        return Array.from({length: end - start + 1}, (_, i) => start + i);
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
                        sizeCTSP: pageSizeCTSP.value,
                        dotGiamGiaId: edit.value ? dotGiamGia.value.id : null,
                    },
                }
            );

            dspList.value = res.data.spList || [];
            const uniqueCtspList = [];
            const seenIds = new Set();
            const currentSelectedIds = new Set(selectedCTSPIds.value);

            console.log("API response ctspList:", res.data.ctspList);
            console.log("ctspIdsInDotGiamGia:", ctspIdsInDotGiamGia.value);
            console.log("currentSelectedIds before fetch:", currentSelectedIds);

            (res.data.ctspList || []).forEach(item => {
                if (!seenIds.has(item.ctsp.id)) {
                    seenIds.add(item.ctsp.id);
                    const isSelected = currentSelectedIds.has(item.ctsp.id) || ctspIdsInDotGiamGia.value.includes(item.ctsp.id);
                    uniqueCtspList.push({ ...item, selected: isSelected });
                    // Cập nhật selectedCTSPIds nếu mục được chọn từ ctspIdsInDotGiamGia
                    if (isSelected && !currentSelectedIds.has(item.ctsp.id)) {
                        selectedCTSPIds.value.push(item.ctsp.id);
                    }
                }
            });
            ctspList.value = uniqueCtspList;

            heDieuHanhList.value = res.data.heDieuHanhList || [];
            nhaSanXuatList.value = res.data.nhaSanXuatList || [];

            const newTotalPagesDSP = res.data.totalPages || 0;
            totalPagesDSP.value = newTotalPagesDSP;

            if (currentPageDSP.value >= newTotalPagesDSP && newTotalPagesDSP > 0) {
                currentPageDSP.value = newTotalPagesDSP - 1;
            }

            totalPagesCTSP.value = res.data.totalPagesCTSP || 0;
            if (currentPageCTSP.value >= totalPagesCTSP.value && totalPagesCTSP.value > 0) {
                currentPageCTSP.value = totalPagesCTSP.value - 1;
            }

            capNhatGiaSauKhiGiam();

            console.log("ctspList after fetch:", ctspList.value.map(item => ({
                id: item.ctsp.id,
                selected: item.selected
            })));
            console.log("selectedCTSPIds after fetch:", selectedCTSPIds.value);
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            toast.value?.addToast({ type: 'error', message: 'Lỗi khi tải dữ liệu', duration: 3000 });
        } finally {
            isLoading.value = false;
        }
    };

    const fetchCTSPData = async (id) => {
        if (!id || isNaN(id)) {
            console.warn("ID sản phẩm không hợp lệ:", id);
            return;
        }
        const wasSelected = idDSPs.value.includes(id);
        if (wasSelected) {
            idDSPs.value = idDSPs.value.filter(dspId => dspId !== id);
            ctspList.value = ctspList.value.map(item => {
                if (item.sp?.id === id) {
                    return { ...item, selected: false };
                }
                return item;
            });
            selectedCTSPIds.value = selectedCTSPIds.value.filter(ctspId => {
                const ctsp = ctspList.value.find(item => item.ctsp.id === ctspId);
                return ctsp && idDSPs.value.includes(ctsp.sp?.id);
            });
        } else {
            idDSPs.value.push(Number(id));
        }

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
                        pageCTSP: currentPageCTSP.value,
                        sizeCTSP: pageSizeCTSP.value,
                        dotGiamGiaId: edit.value ? dotGiamGia.value.id : null,
                    },
                }
            );

            const uniqueCtspList = [];
            const seenIds = new Set();
            const currentSelectedIds = new Set(selectedCTSPIds.value);

            console.log("fetchCTSPData response ctspList:", res.data.ctspList);
            console.log("currentSelectedIds in fetchCTSPData:", currentSelectedIds);

            (res.data.ctspList || []).forEach(item => {
                if (!seenIds.has(item.ctsp.id)) {
                    seenIds.add(item.ctsp.id);
                    const isSelected = currentSelectedIds.has(item.ctsp.id) || ctspIdsInDotGiamGia.value.includes(item.ctsp.id);
                    uniqueCtspList.push({ ...item, selected: isSelected });
                    // Cập nhật selectedCTSPIds nếu mục được chọn từ ctspIdsInDotGiamGia
                    if (isSelected && !currentSelectedIds.has(item.ctsp.id)) {
                        selectedCTSPIds.value.push(item.ctsp.id);
                    }
                }
            });
            ctspList.value = uniqueCtspList;
            totalPagesCTSP.value = res.data.totalPagesCTSP || 0;

            if (currentPageCTSP.value >= totalPagesCTSP.value && totalPagesCTSP.value > 0) {
                currentPageCTSP.value = totalPagesCTSP.value - 1;
                fetchCTSPData(id);
            }
            capNhatGiaSauKhiGiam();

            console.log("ctspList after fetchCTSPData:", ctspList.value.map(item => ({
                id: item.ctsp.id,
                selected: item.selected
            })));
            console.log("selectedCTSPIds after fetchCTSPData:", selectedCTSPIds.value);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu CTSP:", error);
            toast.value?.addToast({ type: 'error', message: 'Lỗi khi tải dữ liệu chi tiết sản phẩm', duration: 3000 });
        } finally {
            isLoading.value = false;
        }
    };

    const selectAllCTSP = () => {
        filteredCTSPList.value.forEach(item => {
            if (!selectedCTSPIds.value.includes(item.ctsp.id)) {
                selectedCTSPIds.value.push(item.ctsp.id);
            }
        });
        ctspList.value = ctspList.value.map(item => {
            if (idDSPs.value.includes(item.sp?.id)) {
                return { ...item, selected: true };
            }
            return item;
        });
    };

    const deselectAllCTSP = () => {
        selectedCTSPIds.value = selectedCTSPIds.value.filter(
            id => !filteredCTSPList.value.some(item => item.ctsp.id === id)
        );
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
        {key: "index", label: "#", formatter: (_, __, index) => index + 1},
        {key: "sp.ma", label: "Mã"},
        {key: "sp.tenSanPham", label: "Tên sản phẩm"},
        {key: "nsx.nhaSanXuat", label: "Hãng"},
        {key: "soLuongCTSP", label: "Số lượng"},
    ]);

    const getNestedValue = (obj, key) => {
        if (key === "index") return null;
        return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : 'N/A'), obj);
    };

    // Trong DotGiamGiaForm.js, sửa formatter của cột select trong columns2
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
    onchange="this.dispatchEvent(new CustomEvent('checkbox-change', { detail: { id: ${item.ctsp.id}, checked: this.checked } }))"
/>`;
            },
        },
        // ... các cột khác giữ nguyên
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
        const filtered = ctspList.value.filter(ctsp => {
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
        console.log("filteredCTSPList:", filtered.map(item => ({
            id: item.ctsp.id,
            selected: item.selected,
            matchesSelectedCTSPIds: selectedCTSPIds.value.includes(item.ctsp.id)
        })));
        return filtered;
    });

    const checkDuplicate = async (field, value, excludeId = null) => {
        try {
            const {data} = await axios.get(`/api/dotGiamGia/ViewAddDotGiamGia/exists/${field}`, {
                params: {[field]: value, excludeId},
            });
            return data;
        } catch (error) {
            console.error("Error calling API:", error);
            toast.value?.addToast({type: 'error', message: 'Lỗi khi kiểm tra trùng lặp', duration: 3000});
            return false;
        }
    };

    const fetchDongSanPham = async () => {
        try {
            const response = await axios.get(`/api/dotGiamGia/viewUpdate?id=${dotGiamGia.value.id}`);
            idDSPs.value = response.data.dspList.map(dsp => dsp.id);
            ctspIdsInDotGiamGia.value = response.data.ctspIds || [];
            fetchData();
        } catch (error) {
            console.error("Lỗi khi lấy danh sách dòng sản phẩm:", error);
            toast.value?.addToast({type: 'error', message: 'Lỗi khi tải danh sách dòng sản phẩm', duration: 3000});
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
        try {
            const toastId = toast.value?.addToast({type: 'info', message: 'Đang xử lý...', isLoading: true});
            let response;
            if (edit.value) {
                response = await axios.put(
                    `/api/dotGiamGia/AddDotGiamGia/${dotGiamGia.value.id}`,
                    requestData,
                    {headers: {"Content-Type": "application/json"}}
                );

                toast.value?.addToast({type: 'success', message: 'Cập nhật thành công', duration: 3000});
            } else {
                response = await axios.post(
                    "/api/dotGiamGia/AddDotGiamGia",
                    requestData,
                    {headers: {"Content-Type": "application/json"}}
                );
                toast.value?.addToast({type: 'success', message: 'Thêm thành công', duration: 3000});
            }
            resetForm();
            setTimeout(() => {
                router.push('/dotGiamGia');
            }, 3000); // Chờ 3 giây để hiển thị toast
        } catch (error) {
            console.error("Lỗi:", error);
            toast.value?.addToast({type: 'error', message: 'Thao tác thất bại!', duration: 3000});
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
        {deep: true}
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
        {immediate: true}
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
        selectedCTSPIds
    };

    return useDotGiamGiaInstance;
};