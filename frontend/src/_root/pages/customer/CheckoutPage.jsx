import { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Grid,
  Paper,
} from "@mui/material";
import {
  useReadOwnCart,
  useReadAllVouchers,
  useCreateNewOrder,
} from "../../../api/queries";
import { useAuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function CheckoutPage() {
  const navigate = useNavigate();
  
  // Get the current user from context
  const { user: currentUser, isLoading: isUserLoading } = useAuthContext();
  
  // Fetch cart, vouchers, and addresses data
  const { data: cartData, isLoading: isCartLoading } = useReadOwnCart(
    currentUser?._id
  );
  
  const { data: vouchersData, isLoading: isVouchersLoading } = useReadAllVouchers();
  
  // Mutation hook for creating a new order
  const { mutateAsync: createOrder, isLoading: isOrderCreating } = useCreateNewOrder();
  
  // Get current date and add 5 days
  const currentDateTime = new Date();
  const takeOrderTime = new Date(currentDateTime);
  takeOrderTime.setDate(takeOrderTime.getDate() + 5);
  
  const [orderData, setOrderData] = useState({
    userId: "",
    paymentStatus: "unpaid",
    paymentMethod: "credit_card",
    shippingCost: 58500,
    orderNote: "",
    expectedReceiveTime: currentDateTime.toISOString().slice(0, 16),
    takeOrderTime: takeOrderTime.toISOString().slice(0, 16),
    address: "6711cc0dcdf8a1dcfcf38f88", // Giữ địa chỉ cứng như yêu cầu
    voucher: [], // Đảm bảo luôn là một mảng
    cart: {
      cartItems: [] // Chỉ giữ spec và quantity
    },
  });
  
  // Dữ liệu địa chỉ cứng (giữ nguyên như trong code gốc)
  const addressesData = [
    {
      _id: "6711cc0dcdf8a1dcfcf38f88",
      address: "123 Lê Lợi",
      ward: "Phường Bến Thành",
      district: "Quận 1",
      city: "TP. Hồ Chí Minh",
    },
    {
      _id: "addr2",
      address: "456 Nguyễn Huệ",
      ward: "Phường Nguyễn Thái Bình",
      district: "Quận 1",
      city: "TP. Hồ Chí Minh",
    },
  ];
  
  // Set user information when currentUser data is loaded
  useEffect(() => {
    if (currentUser && currentUser._id) {
      setOrderData((prevData) => ({
        ...prevData,
        userId: currentUser._id,
      }));
    }
  }, [currentUser]);
  
  // Set cart items when cartData is loaded - Chỉ lấy các trường cần thiết
  useEffect(() => {
    if (cartData && cartData.cartItems && cartData.cartItems.length > 0) {
      setOrderData((prevData) => ({
        ...prevData,
        cart: {
          cartItems: cartData.cartItems.map((item) => ({
            spec: item?.spec?._id,
            quantity: item.quantity,
          })),
        },
      }));
    }
  }, [cartData]);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prevData) => ({ ...prevData, [name]: value }));
  };
  
  // Handle changes within cart items
  const handleNestedChange = (e, index) => {
    const { name, value } = e.target;
    if (name === "quantity") {
      const cartItems = [...orderData.cart.cartItems];
      cartItems[index][name] = parseInt(value, 10); // Đảm bảo quantity là số
      setOrderData((prevData) => ({
        ...prevData,
        cart: { cartItems },
      }));
    }
  };
  
  // Handle adding voucher to order - Đảm bảo voucher luôn là mảng
  const handleAddVoucher = (e) => {
    const { value } = e.target;
    setOrderData((prevData) => ({
      ...prevData,
      voucher: Array.isArray(value) ? value : [],
    }));
  };
  
  // Handle order submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate cart items
    if (!orderData.cart.cartItems || orderData.cart.cartItems.length === 0) {
      alert("Giỏ hàng của bạn đang trống.");
      return;
    }
    
    try {
      console.log("Đang gửi đơn hàng:", orderData);
      // Tạo bản sao của đơn hàng để gửi đi
      const orderPayload = {
        ...orderData,
        expectedReceiveTime: new Date(orderData.expectedReceiveTime).toISOString(),
        takeOrderTime: new Date(orderData.takeOrderTime).toISOString(),
      };
      
      // Gọi API để tạo đơn hàng mới
      await createOrder(orderPayload);
      alert("Đặt hàng thành công!");
      navigate("/");
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      alert(`Đặt hàng thất bại: ${error.message || "Vui lòng thử lại sau"}`);
    }
  };
  
  // Show loading while data is being fetched
  if (isUserLoading || isCartLoading || isVouchersLoading) {
    return <Typography>Đang tải dữ liệu...</Typography>;
  }
  
  // Handle case when cart is empty
  if (!cartData || !cartData.cartItems || cartData.cartItems.length === 0) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Giỏ hàng của bạn đang trống
          </Typography>
          <Button variant="contained" onClick={() => navigate("/products")}>
            Tiếp tục mua sắm
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Đơn đặt hàng
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="ID Người dùng"
            name="userId"
            value={orderData.userId}
            margin="normal"
            disabled
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Trạng thái thanh toán</InputLabel>
            <Select
              name="paymentStatus"
              value={orderData.paymentStatus}
              onChange={handleChange}
            >
              <MenuItem value="unpaid">Chưa thanh toán</MenuItem>
              <MenuItem value="paid">Đã thanh toán</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Phương thức thanh toán</InputLabel>
            <Select
              name="paymentMethod"
              value={orderData.paymentMethod}
              onChange={handleChange}
            >
              <MenuItem value="credit_card">Thẻ tín dụng</MenuItem>
              <MenuItem value="paypal">Paypal</MenuItem>
              <MenuItem value="bank_transfer">Chuyển khoản ngân hàng</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="number"
            label="Phí vận chuyển"
            name="shippingCost"
            value={orderData.shippingCost}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Ghi chú đơn hàng"
            name="orderNote"
            value={orderData.orderNote}
            onChange={handleChange}
            multiline
            rows={4}
            margin="normal"
          />
          <TextField
            fullWidth
            type="datetime-local"
            label="Thời gian nhận dự kiến"
            name="expectedReceiveTime"
            value={orderData.expectedReceiveTime}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            fullWidth
            type="datetime-local"
            label="Thời gian nhận đơn"
            name="takeOrderTime"
            value={orderData.takeOrderTime}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Địa chỉ</InputLabel>
            <Select
              name="address"
              value={orderData.address}
              onChange={handleChange}
            >
              {addressesData.map((address) => (
                <MenuItem key={address._id} value={address._id}>
                  {`${address.address}, ${address.ward}, ${address.district}, ${address.city}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Vouchers</InputLabel>
            <Select
              name="voucher"
              multiple
              value={orderData.voucher}
              onChange={handleAddVoucher}
              renderValue={(selected) =>
                selected
                  .map(
                    (id) =>
                      vouchersData.find((voucher) => voucher._id === id)
                        ?.voucherName || id
                  )
                  .join(", ")
              }
            >
              {vouchersData && vouchersData.map((voucher) => (
                <MenuItem key={voucher._id} value={voucher._id}>
                  {voucher.voucherName} - {voucher.discountPercentage}% giảm
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="h6" gutterBottom mt={2}>
            Các mặt hàng trong giỏ
          </Typography>
          {cartData.cartItems.map((item, index) => (
            <Grid container spacing={2} key={index}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Tên sản phẩm"
                  value={item?.spec?.products?.productName || ""}
                  margin="normal"
                  disabled
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Số lượng"
                  name="quantity"
                  value={orderData.cart.cartItems[index]?.quantity || item.quantity}
                  onChange={(e) => handleNestedChange(e, index)}
                  margin="normal"
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Giá"
                  value={item?.spec?.price || 0}
                  margin="normal"
                  disabled
                />
              </Grid>
            </Grid>
          ))}
          <Box mt={4}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isOrderCreating}
            >
              {isOrderCreating ? "Đang xử lý..." : "Đặt hàng"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default CheckoutPage;