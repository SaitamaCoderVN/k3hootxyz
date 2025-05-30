# K3HOOT - Nền tảng Quiz Web3 trên Solana

K3HOOT là nền tảng quiz Web3 đầu tiên được xây dựng trên blockchain Solana, cho phép người dùng tạo và tham gia các quiz với phần thưởng token.

## Tính năng

- 🎮 Tạo và tham gia quiz realtime
- 🏆 Nhận token khi chiến thắng
- 👥 Chế độ multiplayer với bảng xếp hạng
- 🎨 Giao diện đẹp mắt với hiệu ứng
- 🔒 Tích hợp với ví Solana
- ⚡ Realtime updates với Supabase

## Công nghệ sử dụng

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Framer Motion
- Supabase
- Solana Web3.js

## Cài đặt

1. Clone repository:
```bash
git clone https://github.com/yourusername/k3hoot.git
cd k3hoot
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file môi trường:
```bash
cp .env.example .env.local
```

4. Cập nhật các biến môi trường trong `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Khởi tạo database schema:
```bash
npx supabase init
npx supabase migration up
```

6. Chạy development server:
```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

## Cấu trúc thư mục

```
k3hoot/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── components/       # React components
│   │   │   ├── animations/   # Animation components
│   │   │   ├── audio/       # Audio components
│   │   │   ├── interactive/ # Interactive components
│   │   │   ├── layout/      # Layout components
│   │   │   ├── quiz/        # Quiz components
│   │   │   └── ui/          # UI components
│   │   ├── contexts/        # React contexts
│   │   ├── lib/            # Utility functions
│   │   └── types/          # TypeScript types
│   ├── public/             # Static files
│   └── supabase/          # Supabase configurations
```

## API Routes

- `POST /api/quiz` - Tạo quiz mới
- `GET /api/quiz` - Lấy danh sách quiz
- `GET /api/quiz?id={id}` - Lấy thông tin quiz
- `POST /api/game` - Tạo phòng chơi mới
- `PUT /api/game` - Cập nhật trạng thái phòng
- `GET /api/game?session_id={id}` - Lấy thông tin phòng
- `POST /api/answer` - Gửi câu trả lời

## Contributing

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi (`git commit -m 'Add some amazing feature'`)
4. Push lên branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## License

MIT License - xem [LICENSE](LICENSE) để biết thêm chi tiết.
