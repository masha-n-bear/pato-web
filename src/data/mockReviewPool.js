// Pool of 60 realistic mock reviews from ~25 distinct characters.
// ReviewSection picks 0-10 per restaurant using the restaurant's handle as seed.

export const REVIEW_POOL = [
  // --- Nguyễn Minh Tú (25, sinh viên marketing) ---
  {
    id: 'r01',
    userName: 'Nguyễn Minh Tú',
    avatar: 'T',
    rating: 9.0, foodRating: 9.0, serviceRating: 8.5, ambienceRating: 9.0,
    text: 'Đi cùng hội bạn 6 người, gọi nhiều món mà cái nào cũng vừa miệng. Không khí ấm cúng, nhân viên nhanh nhẹn. Nhất định quay lại!',
    helpful: 14, daysAgo: 8,
  },
  {
    id: 'r02',
    userName: 'Nguyễn Minh Tú',
    avatar: 'T',
    rating: 8.5, foodRating: 8.5, serviceRating: 8.0, ambienceRating: 9.0,
    text: 'Không gian đẹp, chụp ảnh rất ra bức. Món ăn ngon, giá ổn. Cuối tuần hơi đông nên đợi hơi lâu nhưng đáng công chờ!',
    helpful: 9, daysAgo: 22,
  },

  // --- Trần Hải Anh (28, nhân viên văn phòng) ---
  {
    id: 'r03',
    userName: 'Trần Hải Anh',
    avatar: 'A',
    rating: 8.5, foodRating: 8.5, serviceRating: 9.0, ambienceRating: 8.0,
    text: 'Hay đến đây ăn trưa cùng đồng nghiệp. Phục vụ rất nhanh, phù hợp giờ nghỉ trưa ngắn. Đồ ăn ổn định, lần nào ăn cũng thấy ngon.',
    helpful: 18, daysAgo: 5,
  },
  {
    id: 'r04',
    userName: 'Trần Hải Anh',
    avatar: 'A',
    rating: 9.0, foodRating: 9.0, serviceRating: 9.0, ambienceRating: 8.5,
    text: 'Đặt bàn qua điện thoại rất dễ. Hôm đó đến đúng giờ là có bàn ngay. Món ra lần lượt, không phải đợi lâu. Nhân viên chu đáo. Rất hài lòng!',
    helpful: 21, daysAgo: 33,
  },

  // --- Lê Bảo Nguyên (26, graphic designer, hay đi hẹn hò) ---
  {
    id: 'r05',
    userName: 'Lê Bảo Nguyên',
    avatar: 'N',
    rating: 9.5, foodRating: 9.0, serviceRating: 9.5, ambienceRating: 9.5,
    text: 'Đưa người yêu đến đây kỷ niệm 1 năm, không khí cực kỳ lãng mạn. Nhân viên còn chuẩn bị sẵn nến và hoa nhỏ khi mình đặt trước. Cảm ơn nhà hàng rất nhiều!',
    helpful: 35, daysAgo: 45,
  },
  {
    id: 'r06',
    userName: 'Lê Bảo Nguyên',
    avatar: 'N',
    rating: 8.5, foodRating: 8.5, serviceRating: 8.5, ambienceRating: 9.0,
    text: 'Không gian được thiết kế rất có tâm, ánh sáng đẹp. Là người làm thiết kế nên mình để ý nhiều đến chi tiết – ở đây làm khá tốt. Đồ ăn cũng không thua kém.',
    helpful: 11, daysAgo: 17,
  },

  // --- Phạm Quang Huy (29, kỹ sư phần mềm, honest/neutral) ---
  {
    id: 'r07',
    userName: 'Phạm Quang Huy',
    avatar: 'H',
    rating: 7.5, foodRating: 8.0, serviceRating: 7.0, ambienceRating: 7.5,
    text: 'Đồ ăn ngon thật nhưng đợi hơi lâu, gần 25 phút mới ra món. Nhân viên có vẻ bận, không chủ động hỏi thăm. Không gian ổn. Nói chung tạm được, sẽ thử thêm lần nữa.',
    helpful: 16, daysAgo: 12,
  },
  {
    id: 'r08',
    userName: 'Phạm Quang Huy',
    avatar: 'H',
    rating: 8.0, foodRating: 8.5, serviceRating: 7.5, ambienceRating: 8.0,
    text: 'Chất lượng đồ ăn khá tốt, ổn định qua các lần ghé. Tuy nhiên giá có tăng so với trước, phần ăn lại hơi nhỏ hơn. Hy vọng quản lý cân nhắc lại.',
    helpful: 22, daysAgo: 28,
  },

  // --- Vũ Ngọc Mai (27, giáo viên, đi ăn gia đình) ---
  {
    id: 'r09',
    userName: 'Vũ Ngọc Mai',
    avatar: 'M',
    rating: 9.0, foodRating: 9.0, serviceRating: 9.0, ambienceRating: 8.5,
    text: 'Đưa cả gia đình đến ăn cuối tuần. Con mình 5 tuổi cũng được nhân viên quan tâm, còn mang thêm ghế em bé. Đồ ăn ngon, đa dạng cho mọi lứa tuổi. Rất hài lòng!',
    helpful: 27, daysAgo: 19,
  },
  {
    id: 'r10',
    userName: 'Vũ Ngọc Mai',
    avatar: 'M',
    rating: 8.5, foodRating: 9.0, serviceRating: 8.0, ambienceRating: 8.5,
    text: 'Hay đến đây họp mặt gia đình cuối tuần. Không gian đủ rộng cho nhóm đông, đồ ăn phong phú. Đôi khi nhân viên hơi chậm nhưng thái độ luôn vui vẻ, dễ thông cảm.',
    helpful: 13, daysAgo: 40,
  },

  // --- Hoàng Bảo Long (35, food blogger) ---
  {
    id: 'r11',
    userName: 'Hoàng Bảo Long',
    avatar: 'L',
    rating: 8.0, foodRating: 8.5, serviceRating: 7.5, ambienceRating: 8.0,
    text: 'Đã ghé nhiều nhà hàng trong khu vực, đây là một trong những nơi có chất lượng nguyên liệu ổn định nhất. Cách chế biến khá tinh tế, giữ được hương vị đặc trưng. Dịch vụ cần cải thiện thêm nhưng đồ ăn thì thực sự tốt.',
    helpful: 41, daysAgo: 7,
  },
  {
    id: 'r12',
    userName: 'Hoàng Bảo Long',
    avatar: 'L',
    rating: 6.5, foodRating: 6.5, serviceRating: 6.0, ambienceRating: 7.0,
    text: 'Lần này thất vọng hơn lần trước. Món chính ra nguội, khi phản ánh nhân viên không mấy quan tâm. Một quán muốn giữ khách thì consistency là yếu tố then chốt – điều này đang thiếu.',
    helpful: 33, daysAgo: 3,
  },

  // --- Đinh Ngọc Ánh (32, food stylist) ---
  {
    id: 'r13',
    userName: 'Đinh Ngọc Ánh',
    avatar: 'Á',
    rating: 9.0, foodRating: 9.0, serviceRating: 8.5, ambienceRating: 9.5,
    text: 'Là người làm trong ngành food, mình rất ấn tượng với cách trình bày món ăn ở đây. Màu sắc hài hòa, cách bày đĩa có dụng ý. Hương vị cũng không phụ lòng. Không gian rất photogenic!',
    helpful: 29, daysAgo: 15,
  },
  {
    id: 'r14',
    userName: 'Đinh Ngọc Ánh',
    avatar: 'Á',
    rating: 8.5, foodRating: 8.5, serviceRating: 8.0, ambienceRating: 9.0,
    text: 'Ánh sáng trong nhà hàng rất đẹp, tự nhiên và ấm. Phù hợp chụp ảnh đồ ăn mà không cần flash. Đồ ăn ngon, đúng tiêu chuẩn. Recommend cho ai thích vừa ăn vừa chụp!',
    helpful: 17, daysAgo: 26,
  },

  // --- Bùi Thu Hà (42, nội trợ, family-focused) ---
  {
    id: 'r15',
    userName: 'Bùi Thu Hà',
    avatar: 'H',
    rating: 7.0, foodRating: 7.5, serviceRating: 6.5, ambienceRating: 7.0,
    text: 'Đến đây đặt tiệc sinh nhật cho con. Ban đầu nhân viên tư vấn menu khá tốt nhưng hôm tiệc món ra trễ hơn dự kiến. Đồ ăn ngon nhưng số lượng không khớp với những gì đã đặt. Mong cải thiện.',
    helpful: 8, daysAgo: 53,
  },
  {
    id: 'r16',
    userName: 'Bùi Thu Hà',
    avatar: 'H',
    rating: 8.0, foodRating: 8.5, serviceRating: 7.5, ambienceRating: 8.0,
    text: 'Hay đến ăn tối cùng gia đình. Nhà hàng sạch sẽ, đồ ăn ngon và nhiều lựa chọn. Nhân viên thân thiện, nhà có trẻ con cũng được chăm sóc chu đáo. Giá hơi cao một chút nhưng chấp nhận được.',
    helpful: 12, daysAgo: 35,
  },

  // --- Nguyễn Văn Khánh (45, giám đốc kinh doanh, tiếp khách) ---
  {
    id: 'r17',
    userName: 'Nguyễn Văn Khánh',
    avatar: 'K',
    rating: 9.5, foodRating: 9.5, serviceRating: 9.5, ambienceRating: 9.5,
    text: 'Hay dẫn đối tác đến đây tiếp khách. Nhà hàng có không gian riêng tư, phục vụ chuyên nghiệp – đúng chuẩn để đưa khách quan trọng. Đã ghé nhiều lần và chưa lần nào thất vọng.',
    helpful: 38, daysAgo: 10,
  },
  {
    id: 'r18',
    userName: 'Nguyễn Văn Khánh',
    avatar: 'K',
    rating: 9.0, foodRating: 9.0, serviceRating: 9.5, ambienceRating: 9.0,
    text: 'Đặt bàn cho bữa ăn công ty 20 người. Nhân viên hỗ trợ từ khâu sắp xếp đến serving, rất chuyên nghiệp. Chất lượng đồ ăn đồng đều. Sẽ quay lại.',
    helpful: 24, daysAgo: 20,
  },

  // --- Phan Thị Lan (38, kế toán, đi ăn nhóm) ---
  {
    id: 'r19',
    userName: 'Phan Thị Lan',
    avatar: 'L',
    rating: 7.5, foodRating: 8.0, serviceRating: 7.0, ambienceRating: 7.5,
    text: 'Tổ chức tiệc cuối năm ở đây cho nhóm 15 người. Đồ ăn ổn, phong phú. Nhân viên hơi ít so với số lượng khách đông, đôi khi gọi không có ai đến. Không gian đủ rộng.',
    helpful: 6, daysAgo: 42,
  },
  {
    id: 'r20',
    userName: 'Phan Thị Lan',
    avatar: 'L',
    rating: 7.0, foodRating: 7.0, serviceRating: 6.5, ambienceRating: 7.5,
    text: 'Vị trí thuận tiện, dễ đến. Đồ ăn bình thường, không có gì nổi bật. Nếu quản lý chú ý hơn những chi tiết nhỏ sẽ tốt hơn nhiều.',
    helpful: 19, daysAgo: 60,
  },

  // --- Trương Văn Đức (55, hưu trí, thẳng thắn) ---
  {
    id: 'r21',
    userName: 'Trương Văn Đức',
    avatar: 'Đ',
    rating: 8.0, foodRating: 9.0, serviceRating: 7.0, ambienceRating: 8.0,
    text: 'Đồ ăn rất ngon, tôi phải công nhận. Nhưng phục vụ còn nhiều điều cần cải thiện – nhân viên trẻ ít kinh nghiệm, thiếu chủ động. Nếu được đào tạo bài bản hơn sẽ là nhà hàng rất tốt.',
    helpful: 15, daysAgo: 25,
  },
  {
    id: 'r22',
    userName: 'Trương Văn Đức',
    avatar: 'Đ',
    rating: 7.0, foodRating: 7.0, serviceRating: 7.0, ambienceRating: 7.5,
    text: 'Đến đây vì con dẫn đi. Không gian ổn, đồ ăn vừa miệng. Riêng tôi thấy giá hơi cao so với lượng thức ăn. Gu của mỗi người thôi.',
    helpful: 10, daysAgo: 48,
  },

  // --- Lý Thị Bình (52, giáo viên, conservative reviewer) ---
  {
    id: 'r23',
    userName: 'Lý Thị Bình',
    avatar: 'B',
    rating: 7.5, foodRating: 8.0, serviceRating: 7.5, ambienceRating: 7.0,
    text: 'Đến ăn cùng đồng nghiệp nhân dịp 20/11. Nhà hàng sạch sẽ, món ăn tươi ngon. Nhân viên lịch sự nhưng hơi chậm. Nói chung là một buổi ăn vui vẻ.',
    helpful: 7, daysAgo: 56,
  },
  {
    id: 'r24',
    userName: 'Lý Thị Bình',
    avatar: 'B',
    rating: 8.0, foodRating: 8.0, serviceRating: 8.0, ambienceRating: 8.0,
    text: 'Lần thứ ba ghé rồi. Mỗi lần đến chất lượng khá ổn định. Con trai tôi cũng thích. Sẽ giới thiệu cho đồng nghiệp nữa.',
    helpful: 5, daysAgo: 30,
  },

  // --- Đỗ Minh Nhật (31, nhiếp ảnh gia, notices ambience) ---
  {
    id: 'r25',
    userName: 'Đỗ Minh Nhật',
    avatar: 'N',
    rating: 9.0, foodRating: 8.5, serviceRating: 9.0, ambienceRating: 9.5,
    text: 'Đến đây vừa ăn vừa chụp ảnh cho dự án cá nhân. Không gian cực kỳ đẹp, ánh sáng tự nhiên tốt, góc nào cũng ra ảnh. Đồ ăn ngon, nhân viên thoải mái để mình setup góc chụp.',
    helpful: 20, daysAgo: 14,
  },
  {
    id: 'r26',
    userName: 'Đỗ Minh Nhật',
    avatar: 'N',
    rating: 8.5, foodRating: 8.5, serviceRating: 8.5, ambienceRating: 9.0,
    text: 'Kiến trúc nhà hàng rất có hồn, từng chi tiết trang trí đều có chủ đích. Đồ ăn trình bày đẹp không kém không gian. Một trải nghiệm ăn uống hoàn chỉnh.',
    helpful: 16, daysAgo: 38,
  },

  // --- Cao Thị Hương (34, y tá, positive after long shifts) ---
  {
    id: 'r27',
    userName: 'Cao Thị Hương',
    avatar: 'H',
    rating: 9.0, foodRating: 9.0, serviceRating: 9.0, ambienceRating: 8.5,
    text: 'Sau ca trực dài, mấy chị em hay ghé đây ăn. Phục vụ rất nhanh và thân thiện dù đến muộn. Đồ ăn nóng hổi, ngon. Đây là quán ruột của cả nhóm rồi!',
    helpful: 31, daysAgo: 6,
  },
  {
    id: 'r28',
    userName: 'Cao Thị Hương',
    avatar: 'H',
    rating: 8.5, foodRating: 9.0, serviceRating: 8.0, ambienceRating: 8.5,
    text: 'Là y tá nên tôi khá chú ý vệ sinh thực phẩm. Nhà hàng này khá tốt về điểm đó – bếp thoáng, đồ ăn tươi, dụng cụ sạch sẽ. Tôi yên tâm ăn và giới thiệu cho bạn bè.',
    helpful: 23, daysAgo: 21,
  },

  // --- Võ Anh Tuấn (22, sinh viên đại học, budget-conscious) ---
  {
    id: 'r29',
    userName: 'Võ Anh Tuấn',
    avatar: 'T',
    rating: 8.0, foodRating: 8.5, serviceRating: 8.0, ambienceRating: 7.5,
    text: 'Sinh viên như mình mà đến được đây là phải tiết kiệm cả tuần. Nhưng mà đáng! Đồ ăn ngon thật, không gian đẹp. Hôm đó nhân viên còn tặng thêm món tráng miệng nhỏ. Bất ngờ lắm!',
    helpful: 26, daysAgo: 9,
  },
  {
    id: 'r30',
    userName: 'Võ Anh Tuấn',
    avatar: 'T',
    rating: 7.5, foodRating: 8.0, serviceRating: 7.5, ambienceRating: 7.0,
    text: 'Giá ổn so với vị trí và không gian. Đồ ăn ngon nhưng phần không nhiều lắm. Nếu đang đói thật sự thì nên gọi thêm cơm cho no. Sẽ quay lại khi có tiền trợ cấp tháng sau.',
    helpful: 34, daysAgo: 44,
  },

  // --- Ngô Thanh Thảo (30, marketing manager) ---
  {
    id: 'r31',
    userName: 'Ngô Thanh Thảo',
    avatar: 'T',
    rating: 9.0, foodRating: 9.0, serviceRating: 9.0, ambienceRating: 9.0,
    text: 'Dẫn team đến đây team building. Nhà hàng đã sắp xếp bàn rất chu đáo theo yêu cầu. Không khí vui vẻ, đồ ăn ngon, mọi người đều thích. Sẽ đặt lại cho đợt tổng kết cuối năm.',
    helpful: 19, daysAgo: 16,
  },
  {
    id: 'r32',
    userName: 'Ngô Thanh Thảo',
    avatar: 'T',
    rating: 8.5, foodRating: 8.5, serviceRating: 9.0, ambienceRating: 8.5,
    text: 'Làm marketing nên hay để ý brand experience. Nhà hàng này làm tốt từ presentation đến service. Nhân viên được đào tạo tốt, nhớ mặt khách quen. Đáng để trải nghiệm.',
    helpful: 14, daysAgo: 29,
  },

  // --- Trịnh Văn Hùng (33, thầy giáo dạy nhạc, neutral) ---
  {
    id: 'r33',
    userName: 'Trịnh Văn Hùng',
    avatar: 'H',
    rating: 7.0, foodRating: 7.5, serviceRating: 6.5, ambienceRating: 7.5,
    text: 'Âm nhạc phát trong nhà hàng quá to, không nói chuyện được với nhau. Đồ ăn ngon nhưng trải nghiệm bị ảnh hưởng bởi tiếng ồn. Nếu chỉnh volume xuống một chút sẽ tốt hơn nhiều.',
    helpful: 28, daysAgo: 11,
  },
  {
    id: 'r34',
    userName: 'Trịnh Văn Hùng',
    avatar: 'H',
    rating: 8.0, foodRating: 8.5, serviceRating: 7.5, ambienceRating: 7.5,
    text: 'Không gian lần này yên tĩnh hơn lần trước. Đồ ăn ngon, phong phú. Nhân viên nhanh nhẹn hơn. Thấy nhà hàng đang cố cải thiện. Cộng thêm 1 điểm so với lần trước.',
    helpful: 9, daysAgo: 36,
  },

  // --- Lưu Ngọc Diễm (24, sinh viên y khoa) ---
  {
    id: 'r35',
    userName: 'Lưu Ngọc Diễm',
    avatar: 'D',
    rating: 9.5, foodRating: 9.0, serviceRating: 10.0, ambienceRating: 9.5,
    text: 'Sinh nhật năm nay được bạn bè bất ngờ dẫn đến đây. Nhân viên biết trước và đã chuẩn bị bánh kem nhỏ kèm bài hát, cả nhóm xúc động lắm. Đồ ăn cực kỳ ngon. Nhớ mãi buổi tối đó!',
    helpful: 47, daysAgo: 62,
  },
  {
    id: 'r36',
    userName: 'Lưu Ngọc Diễm',
    avatar: 'D',
    rating: 8.0, foodRating: 8.5, serviceRating: 8.0, ambienceRating: 8.0,
    text: 'Học y nên ăn uống cũng có tiêu chuẩn nhất định. Nhà hàng này đạt về vệ sinh, nguyên liệu tươi. Đồ ăn ngon và bổ. Giá cả hợp lý so với chất lượng.',
    helpful: 13, daysAgo: 31,
  },

  // --- Mai Kiều Trang (36, kế toán trưởng, family occasions) ---
  {
    id: 'r37',
    userName: 'Mai Kiều Trang',
    avatar: 'T',
    rating: 9.0, foodRating: 9.0, serviceRating: 9.0, ambienceRating: 8.5,
    text: 'Đặt bàn cho cả đại gia đình dịp cuối tuần. Nhà hàng phục vụ rất tốt, có chỗ để xe rộng rãi. Trẻ em thích lắm. Đồ ăn phong phú cho cả người lớn và trẻ nhỏ.',
    helpful: 22, daysAgo: 18,
  },
  {
    id: 'r38',
    userName: 'Mai Kiều Trang',
    avatar: 'T',
    rating: 8.5, foodRating: 8.5, serviceRating: 8.5, ambienceRating: 8.5,
    text: 'Đến nhân dịp kỷ niệm đám cưới với chồng. Nhà hàng tuy không phải fine dining nhưng không khí ấm cúng và đồ ăn ngon khiến buổi tối rất đặc biệt. Cảm ơn nhà hàng!',
    helpful: 18, daysAgo: 47,
  },

  // --- Dương Quốc Bảo (40, kiến trúc sư, detail-oriented) ---
  {
    id: 'r39',
    userName: 'Dương Quốc Bảo',
    avatar: 'B',
    rating: 7.5, foodRating: 8.0, serviceRating: 7.0, ambienceRating: 8.5,
    text: 'Là kiến trúc sư, mình đánh giá cao không gian nội thất nơi đây. Thiết kế thông minh, sử dụng ánh sáng tự nhiên tốt. Đồ ăn ngon. Nhưng dịch vụ cần cải thiện để xứng tầm với không gian.',
    helpful: 11, daysAgo: 23,
  },
  {
    id: 'r40',
    userName: 'Dương Quốc Bảo',
    avatar: 'B',
    rating: 8.5, foodRating: 8.5, serviceRating: 8.5, ambienceRating: 9.0,
    text: 'Ghé lại lần thứ ba. Lần này dịch vụ đã cải thiện rõ rệt. Không gian vẫn đẹp, thậm chí thấy họ đã sắp xếp lại layout hợp lý hơn. Đồ ăn vẫn ngon ổn định. Tiến bộ rõ ràng!',
    helpful: 15, daysAgo: 5,
  },

  // --- Hồ Phương Anh (29, nhân viên ngân hàng, dating) ---
  {
    id: 'r41',
    userName: 'Hồ Phương Anh',
    avatar: 'A',
    rating: 9.0, foodRating: 8.5, serviceRating: 9.0, ambienceRating: 9.5,
    text: 'Date đầu tiên với bạn trai ở đây. Không khí lãng mạn, ánh đèn dịu nhẹ, nhạc nhẹ nhàng vừa đủ nghe. Nhân viên tinh tế, không làm phiền. Đồ ăn ngon. Buổi tối rất thành công!',
    helpful: 39, daysAgo: 13,
  },
  {
    id: 'r42',
    userName: 'Hồ Phương Anh',
    avatar: 'A',
    rating: 8.0, foodRating: 8.5, serviceRating: 7.5, ambienceRating: 8.5,
    text: 'Đến đây tự thưởng bản thân sau khi vượt qua kỳ thi thăng hạng. Ăn ngon, không gian đẹp, dù đến một mình vẫn thấy thoải mái. Nhân viên không có thái độ kỳ lạ với người ăn solo.',
    helpful: 25, daysAgo: 50,
  },

  // --- Trần Minh Khoa (26, lập trình viên, terse) ---
  {
    id: 'r43',
    userName: 'Trần Minh Khoa',
    avatar: 'K',
    rating: 8.0, foodRating: 8.0, serviceRating: 8.0, ambienceRating: 7.5,
    text: 'Đồ ăn: ngon. Phục vụ: ổn. Giá: chấp nhận được. Wifi: có. Sẽ quay lại.',
    helpful: 44, daysAgo: 2,
  },
  {
    id: 'r44',
    userName: 'Trần Minh Khoa',
    avatar: 'K',
    rating: 7.0, foodRating: 7.5, serviceRating: 6.5, ambienceRating: 7.5,
    text: 'Đợi 30 phút không có nhân viên đến. Cuối cùng tự ra quầy gọi. Workaround hoạt động. Đồ ăn thì ổn. 7/10.',
    helpful: 52, daysAgo: 27,
  },

  // --- Nguyễn Hồng Nhung (44, bác sĩ, hygiene-conscious) ---
  {
    id: 'r45',
    userName: 'Nguyễn Hồng Nhung',
    avatar: 'N',
    rating: 5.0, foodRating: 5.5, serviceRating: 4.5, ambienceRating: 6.0,
    text: 'Là bác sĩ, tôi rất chú ý vệ sinh thực phẩm. Nhà hàng này có một số điểm chưa đạt: bàn ăn không được lau sạch trước khi khách ngồi, đồ dùng có vết ố. Không thể recommend trong tình trạng này.',
    helpful: 30, daysAgo: 4,
  },
  {
    id: 'r46',
    userName: 'Nguyễn Hồng Nhung',
    avatar: 'N',
    rating: 7.5, foodRating: 8.0, serviceRating: 7.5, ambienceRating: 7.0,
    text: 'Lần này thấy đã cải thiện hơn về vệ sinh. Bàn sạch, đồ dùng sạch. Đồ ăn ngon hơn lần trước. Mong nhà hàng duy trì tiêu chuẩn này.',
    helpful: 12, daysAgo: 39,
  },

  // --- Phạm Văn Toản (50, thương nhân, business dining) ---
  {
    id: 'r47',
    userName: 'Phạm Văn Toản',
    avatar: 'T',
    rating: 9.5, foodRating: 9.5, serviceRating: 9.5, ambienceRating: 9.0,
    text: 'Đã đến nhiều nhà hàng. Đây là một trong những nơi tôi tín nhiệm nhất để tiếp đối tác. Nhân viên am hiểu menu, tư vấn khéo léo. Chất lượng ổn định qua nhiều lần. Recommend 10/10.',
    helpful: 28, daysAgo: 32,
  },
  {
    id: 'r48',
    userName: 'Phạm Văn Toản',
    avatar: 'T',
    rating: 9.0, foodRating: 9.0, serviceRating: 9.0, ambienceRating: 9.0,
    text: 'Đặt bàn riêng cho hội đồng quản trị 8 người. Mọi thứ được chuẩn bị kỹ lưỡng, không có sai sót. Nhân viên phục vụ chuyên nghiệp. Ấn tượng tốt với khách mời.',
    helpful: 21, daysAgo: 55,
  },

  // --- Đinh Thị Quỳnh (31, critical customer) ---
  {
    id: 'r49',
    userName: 'Đinh Thị Quỳnh',
    avatar: 'Q',
    rating: 4.0, foodRating: 4.5, serviceRating: 3.5, ambienceRating: 5.0,
    text: 'Thực sự thất vọng. Đặt bàn trước 2 ngày nhưng đến nơi không có bàn, phải chờ thêm 20 phút. Khi gọi món nhân viên ghi sai, mang ra không đúng. Khi phản ánh thì thái độ không thiện chí.',
    helpful: 36, daysAgo: 17,
  },
  {
    id: 'r50',
    userName: 'Đinh Thị Quỳnh',
    avatar: 'Q',
    rating: 6.5, foodRating: 7.0, serviceRating: 6.0, ambienceRating: 6.5,
    text: 'Lần hai ghé vì bạn năn nỉ. Đồ ăn lần này ngon hơn. Nhưng vẫn còn vấn đề về phục vụ – nhân viên ít và không chủ động. Kỳ vọng đặt cao hơn giá trị thực nhận được.',
    helpful: 14, daysAgo: 43,
  },

  // --- Nguyễn Thị Kim Anh (33, HR manager) ---
  {
    id: 'r51',
    userName: 'Nguyễn Thị Kim Anh',
    avatar: 'A',
    rating: 8.5, foodRating: 8.5, serviceRating: 8.5, ambienceRating: 8.5,
    text: 'Tổ chức buổi gặp mặt nhân viên mới ở đây. Nhà hàng linh hoạt trong cách bố trí bàn ghế theo yêu cầu. Đồ ăn đa dạng, mọi người đều hài lòng. Sẽ dùng lại cho các sự kiện tới.',
    helpful: 17, daysAgo: 24,
  },

  // --- Lâm Tuấn Kiệt (37, đam mê nấu ăn) ---
  {
    id: 'r52',
    userName: 'Lâm Tuấn Kiệt',
    avatar: 'K',
    rating: 8.0, foodRating: 9.0, serviceRating: 7.5, ambienceRating: 8.0,
    text: 'Tôi thích nấu ăn nên khi ăn ở ngoài rất để ý cách chế biến. Nhà hàng này dùng gia vị cân đối, không quá mặn hay ngọt. Nguyên liệu tươi, kỹ thuật nấu tốt. Đáng nể đội bếp.',
    helpful: 20, daysAgo: 37,
  },

  // --- Trần Bích Phượng (47, mẹ hai con tuổi teen) ---
  {
    id: 'r53',
    userName: 'Trần Bích Phượng',
    avatar: 'P',
    rating: 8.5, foodRating: 8.5, serviceRating: 8.5, ambienceRating: 8.5,
    text: 'Dẫn hai đứa con tuổi teen đến ăn. Cả hai đứa đều thích – cái này hiếm lắm vì tụi nó khó tính. Đồ ăn đa dạng cho nhiều khẩu vị. Không gian thoải mái cho cả nhóm.',
    helpful: 16, daysAgo: 20,
  },

  // --- Đặng Nhật Quang (28, hay đi ăn ngày nghỉ) ---
  {
    id: 'r54',
    userName: 'Đặng Nhật Quang',
    avatar: 'Q',
    rating: 9.0, foodRating: 9.5, serviceRating: 8.5, ambienceRating: 8.5,
    text: 'Ngày nghỉ thích tự đến nhà hàng ăn cho khác hẳn ngày thường. Ở đây ngon khi ăn tại chỗ – mùi thơm, không khí, phục vụ đủ cả. Trải nghiệm rất trọn vẹn.',
    helpful: 32, daysAgo: 15,
  },

  // --- Lê Thị Xuân Hương (61, hưu trí, đi ăn với chồng) ---
  {
    id: 'r55',
    userName: 'Lê Thị Xuân Hương',
    avatar: 'H',
    rating: 8.5, foodRating: 9.0, serviceRating: 8.5, ambienceRating: 8.0,
    text: 'Ông xã đưa đi ăn nhân dịp sinh nhật tôi. Nhân viên nghe biết có dịp đặc biệt thì chú ý hơn, mang thêm chút đồ uống nhỏ tặng kèm. Cảm động lắm. Đồ ăn ngon, vừa miệng.',
    helpful: 24, daysAgo: 28,
  },

  // --- Hoàng Minh Đức (19, sinh viên năm nhất) ---
  {
    id: 'r56',
    userName: 'Hoàng Minh Đức',
    avatar: 'Đ',
    rating: 9.0, foodRating: 9.0, serviceRating: 8.5, ambienceRating: 9.0,
    text: 'Lần đầu tiên đến đây, được bạn cùng phòng dẫn đi. Ăn ngon quá! Nhân viên còn giúp mình chọn món vì không biết gọi gì. Sẽ dành tiền mấy tuần để quay lại.',
    helpful: 29, daysAgo: 8,
  },

  // --- Trần Thị Mỹ Dung (39, sales manager, business lunch) ---
  {
    id: 'r57',
    userName: 'Trần Thị Mỹ Dung',
    avatar: 'D',
    rating: 8.0, foodRating: 8.0, serviceRating: 8.5, ambienceRating: 8.0,
    text: 'Hay dẫn khách hàng đến đây ăn trưa. Vị trí tốt, dễ đến, có chỗ đậu xe. Phục vụ chuyên nghiệp, không làm mình ngại trước khách. Đồ ăn đủ ngon để cuộc gặp diễn ra suôn sẻ.',
    helpful: 11, daysAgo: 33,
  },

  // --- Nguyễn Hoàng Phúc (25, hay đi ăn khám phá) ---
  {
    id: 'r58',
    userName: 'Nguyễn Hoàng Phúc',
    avatar: 'P',
    rating: 8.5, foodRating: 8.5, serviceRating: 8.5, ambienceRating: 8.5,
    text: 'Ghé theo gợi ý của người quen. Không uổng! Đồ ăn đặc trưng, được làm đúng kiểu. Không khí địa phương đặc sắc. Recommend cho ai muốn tìm quán ngon trong khu vực này.',
    helpful: 37, daysAgo: 19,
  },

  // --- Ngô Thị Thu Hiền (43, critical, mid-level) ---
  {
    id: 'r59',
    userName: 'Ngô Thị Thu Hiền',
    avatar: 'H',
    rating: 6.0, foodRating: 6.5, serviceRating: 5.5, ambienceRating: 6.5,
    text: 'Đặt bàn nhưng hôm đến không có bàn như yêu cầu. Chờ 15 phút mới có bàn thay thế, vị trí không tốt. Đồ ăn vị trung bình. Với mức giá này kỳ vọng cao hơn.',
    helpful: 18, daysAgo: 46,
  },

  // --- Vũ Thanh Lâm (30, huấn luyện viên thể hình, health-conscious) ---
  {
    id: 'r60',
    userName: 'Vũ Thanh Lâm',
    avatar: 'L',
    rating: 8.0, foodRating: 8.5, serviceRating: 8.0, ambienceRating: 7.5,
    text: 'Là trainer, tôi thích nơi có options ăn uống lành mạnh. Nhà hàng này có menu cân đối, có thể yêu cầu ít dầu mỡ và nhân viên sẵn sàng điều chỉnh. Đồ ăn ngon mà vẫn đảm bảo dinh dưỡng.',
    helpful: 13, daysAgo: 11,
  },
];
