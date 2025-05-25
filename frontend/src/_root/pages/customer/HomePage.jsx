import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, CircularProgress, Grid2, keyframes } from "@mui/material";
import Slider from "react-slick";
import BannerSlider from "../../../components/Homepage/BannerSlider";
import ProductCard from "../../../components/Homepage/ProductCard";
import SubNavbar from "../../../components/Homepage/Subnavbar";
import { useReadAllCategory, useReadAllProduct, useReadPopularProduct, useReadWishlistItems } from "../../../api/queries";
import { useAuthContext } from "../../../context/AuthContext";
import { Loading } from "../../../components";

const flash = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

const HomePage = () => {
    const { user, isAuthenticated } = useAuthContext();
    const [userId, setUserId] = useState()
    const { data: categories, isLoading: isLoadingCat } = useReadAllCategory();
    const {
        data: products,
        isLoading: isLoadingProd,
        isError,
        error,
    } = useReadAllProduct();

    const { data: popularProducts, isLoading: isLoadingPopularProduct } = useReadPopularProduct();

    const { data: wishList } = useReadWishlistItems(userId);

    useEffect(() => {
        if (!isAuthenticated || !user._id) return;
        setUserId(user._id)
    }, [isAuthenticated, user]);
    if (isLoadingCat || isLoadingProd) {
        return <Loading />;
    }

    if (isError || !products) {
        return <Typography>Có lỗi xảy ra: {error.message}</Typography>;
    }

    return (
        <>
            <Box
                component={"section"}
                sx={{ "& .MuiContainer-root": { p: { md: "12px", lg: "0" }, backgroundColor: 'white' } }}
            >
                <Box display={"flex"}>
                    <SubNavbar categories={categories} />
                    <Box
                        height="400px"
                        width={{ xs: "100%", md: "calc(100% - 220px)" }}
                    >
                        <BannerSlider />
                    </Box>
                </Box>

                {/* Promotion Products Section */}
                {
                    products?.filter(product => product.specs[0]?.discountPercentage).length > 0
                    &&
                    <div
                        style={{
                            background: 'linear-gradient(0deg, #fffbe6,#fff, #ffffff)', // nền sáng nhẹ
                            padding: '16px 24px',
                            borderRadius: '16px',
                            borderLeft: '6px solid #FFD500', // điểm nhấn màu vàng
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // bóng đổ mềm
                            marginBottom: '24px',
                        }}
                    >
                        <Typography
                            variant="h4"
                            align="left"
                            sx={{ 
                                // margin: "12px 0 30px 0", fontSize: "24px", fontWeight: "600" 
                                margin: "12px 0 30px 0",
                                fontSize: "24px",
                                fontWeight: "600",
                                color: "#FFD500",
                                animation: `${flash} 3s infinite`,
                            }}
                        >
                            Sản phẩm khuyến mãi
                        </Typography>
                        <Box 
                        // display='inline-flex' gap={2} overflow="auto" width="100%" py={1}
                            display="inline-flex"
                            gap={2}
                            overflow="auto"
                            width="100%"
                            bgcolor="white"
                        >
                            {products?.filter(product => product.specs[0]?.discountPercentage).map((product) => (
                                <ProductCard wishList={wishList} customer={user} isLoggedIn={isAuthenticated} product={product} key={product._id} />
                            ))}
                        </Box>
                    </div>
                }

                {/* Popular Products Section */}
                {
                    popularProducts
                    &&
                    <div
                        style={{
                            backgroundColor: 'white',
                            padding: '4px 16px 4px 16px',
                            borderRadius: '8px',
                            boxShadow: "0 0 8px rgba(0,0,0,0.15)",
                            marginBottom: '12px'
                        }}
                    >
                        <Typography
                            variant="h4"
                            align="left"
                            sx={{ margin: "12px 0 30px 0", fontSize: "24px", fontWeight: "600" }}
                        >
                            Sản phẩm thịnh hành
                        </Typography>
                        <Box display='inline-flex' gap={2} overflow="auto" width="100%" py={1}>
                            {
                                !popularProducts || !popularProducts.length || isLoadingPopularProduct ?
                                    <Loading /> :
                                    popularProducts?.map((product) => (
                                        <ProductCard wishList={wishList} customer={user} isLoggedIn product={product} key={product._id} />
                                    ))
                            }
                        </Box>
                    </div>
                }
                {/* Featured Products Section */}
                <div
                    style={{
                        backgroundColor: 'white',
                        padding: '4px 16px 4px 16px',
                        borderRadius: '8px',
                        boxShadow: "0 0 8px rgba(0,0,0,0.15)",
                        marginBottom: '12px'
                    }}
                >

                    <Typography
                        variant="h4"
                        align="left"
                        sx={{ margin: "12px 0 30px 0", fontSize: "24px", fontWeight: "600" }}
                    >
                        Tất cả sản phẩm
                    </Typography>
                    <Box display='inline-flex' gap={2} overflow="auto" width="100%" py={1}>
                        {products?.map((product) => (
                            <ProductCard wishList={wishList} customer={user} isLoggedIn={isAuthenticated} product={product} key={product._id} />
                        ))}
                    </Box>
                </div>
            </Box>
        </>
    );
};

export default HomePage;
