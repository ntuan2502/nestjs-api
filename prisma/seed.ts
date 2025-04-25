import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedOffices() {
  try {
    // await prisma.$executeRaw`TRUNCATE TABLE "Office" RESTART IDENTITY CASCADE`;
    // console.log('✅ Cleared existing Office and reset IDs');

    const offices = [
      {
        name: 'CÔNG TY CỔ PHẦN ĐÔ THỊ AMATA BIÊN HÒA',
        internationalName: 'AMATA CITY BIENHOA JOINT STOCK COMPANY',
        shortName: 'ACBH',
        taxCode: '3600265395',
        address:
          'KCN Long Bình (Amata), Phường Long Bình, Thành phố Biên Hoà, Tỉnh Đồng Nai, Việt Nam',
      },
      {
        name: 'CÔNG TY CỔ PHẦN ĐÔ THỊ AMATA HẠ LONG',
        internationalName: 'AMATA CITY HA LONG JOINT STOCK COMPANY',
        shortName: 'ACHL',
        taxCode: '5701929293',
        address:
          'Khu Công nghiệp Sông Khoai, Xã Sông Khoai, Thị xã Quảng Yên, Tỉnh Quảng Ninh, Việt Nam',
      },
      {
        name: 'CÔNG TY CỔ PHẦN ĐÔ THỊ AMATA LONG THÀNH',
        internationalName: 'AMATA CITY LONGTHANH JOINT STOCK COMPANY',
        shortName: 'ACLT',
        taxCode: '3603295006',
        address:
          'Khu Công Nghiệp Công Nghệ Cao Long Thành, Thị Trấn Long Thành, Huyện Long Thành, Tỉnh Đồng Nai, Việt Nam',
      },
      {
        name: 'CÔNG TY TNHH THÀNH PHỐ AMATA LONG THÀNH',
        internationalName: 'AMATA TOWNSHIP LONG THANH COMPANY LIMITED',
        shortName: 'ATLT',
        taxCode: '3603404368',
        address:
          'Trung tâm dịch vụ Amata, Khu thương mại Amata, Phường Long Bình, Thành phố Biên Hoà, Tỉnh Đồng Nai, Việt Nam',
      },
    ];

    for (const office of offices) {
      await prisma.office.create({
        data: office,
      });
      console.log(`Seeded: ${office.name}`);
    }

    console.log('Office seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding offices:', error);
  }
}

async function seedDepartments() {
  try {
    // await prisma.$executeRaw`TRUNCATE TABLE "Department" RESTART IDENTITY CASCADE`;
    // console.log('✅ Cleared existing departments and reset IDs');

    const departments = [
      'Accounting',
      'Administration',
      'Business Development',
      'Electricity Operation',
      'General Director',
      'Human Resource',
      'Information Technology',
      'Land Management',
      'Legal',
      'Personal Assistant',
      'Project Management',
      'Relationship Management',
      'Sales & Marketing',
      'Secretary',
      'Site Management',
      'Water & Environment',
    ];

    for (const name of departments) {
      await prisma.department.create({
        data: {
          name,
        },
      });
      console.log(`Seeded department: ${name}`);
    }
    console.log('✅ Department seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding departments:', error);
  }
}

async function seedUser() {
  try {
    // await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
    // console.log('✅ Cleared existing users and reset IDs');

    const passwordHash = await bcrypt.hash('Amata@123', 10);
    const users = [
      {
        name: 'Bui Viet Duong',
        email: 'vietduong@amata.com',
        department: '4',
        office: '2',
        phone: '0392132134',
      },
      {
        name: 'Chu Phuong Hong',
        email: 'hong@amata.com',
        department: '15',
        office: '1',
        phone: '0908797651',
      },
      {
        name: 'Dang Duc Trung',
        email: 'ductrung@amata.com',
        department: '3',
        office: '1',
        phone: '0982397970',
      },
      {
        name: 'Dang Ngoc Thuy Trang',
        email: 'thuytrang@amata.com',
        department: '8',
        office: '1',
        phone: '0853586930',
      },
      {
        name: 'Dao Ngoc Tien',
        email: 'tien@amata.com',
        department: '15',
        office: '1',
        phone: '0973704064',
      },
      {
        name: 'Dinh Nguyen Thuy Trang',
        email: 'trang@amata.com',
        department: '1',
        office: '4',
        phone: '0983700979',
      },
      {
        name: 'Dinh Thu Uyen',
        email: 'uyen@amata.com',
        department: '6',
        office: '2',
        phone: '0904035830',
      },
      {
        name: 'Doan Thi Lan Anh',
        email: 'lananh@amata.com',
        department: '7',
        office: '2',
        phone: '0368933306',
      },
      {
        name: 'Doan Thi Ngoc Hien',
        email: 'ngochien@amata.com',
        department: '1',
        office: '1',
        phone: '0909515064',
      },
      {
        name: 'Doan Trung Diep',
        email: 'diep@amata.com',
        department: '7',
        office: '1',
        phone: '0933609216',
      },
      {
        name: 'Do Quang Huy',
        email: 'quanghuy@amata.com',
        department: '8',
        office: '2',
        phone: '0913266046',
      },
      {
        name: 'Electricity',
        email: 'occ-amata@amata.com',
        department: '4',
        office: '2',
        phone: '0354158016',
      },
      {
        name: 'Hoang Thanh Nghia',
        email: 'nghia@amata.com',
        department: '16',
        office: '3',
        phone: '0937996763',
      },
      {
        name: 'Hoang Thi Tuong Van',
        email: 'van@amata.com',
        department: '6',
        office: '1',
        phone: '0903051786',
      },
      {
        name: 'Hoang To Anh',
        email: 'toanh@amata.com',
        department: '12',
        office: '1',
        phone: '0919817704',
      },
      {
        name: 'Hoang Van Quan',
        email: 'hoangquan@amata.com',
        department: '8',
        office: '2',
        phone: '0981976886',
      },
      {
        name: 'Ho Dang Duy Phuc',
        email: 'duyphuc@amata.com',
        department: '11',
        office: '3',
        phone: '0903880306',
      },
      {
        name: 'Ho Duy Hanh',
        email: 'hanh@amata.com',
        department: '3',
        office: '3',
        phone: '0916280202',
      },
      {
        name: 'Huynh Hoai Nhan',
        email: 'hoainhan@amata.com',
        department: '15',
        office: '1',
        phone: '0964631748',
      },
      {
        name: 'Huynh Minh Quang',
        email: 'quang@amata.com',
        department: '16',
        office: '1',
        phone: '0368108383',
      },
      {
        name: 'Huynh Ngoc Hoang Dung',
        email: 'hoangdung@amata.com',
        department: '13',
        office: '1',
        phone: '0909797560',
      },
      {
        name: 'Huynh The Dat',
        email: 'dat.huynh@amata.com',
        department: '15',
        office: '1',
        phone: '#N/A',
      },
      {
        name: 'Huynh Uyen Diem Trinh',
        email: 'trinh@amata.com',
        department: '2',
        office: '3',
        phone: '0918806623',
      },
      {
        name: 'ITAM',
        email: 'ITAM@amata.com',
        department: '7',
        office: '1',
        phone: '#N/A',
      },
      {
        name: 'Kenichi Saito',
        email: 'Kensaito@amata.com',
        department: '13',
        office: '3',
        phone: '0937357007',
      },
      {
        name: 'Lam Thi Dan An',
        email: 'danan@amata.com',
        department: '1',
        office: '1',
        phone: '0908041107',
      },
      {
        name: 'Lam Van Nam',
        email: 'vannam@amata.com',
        department: '15',
        office: '1',
        phone: '0919260887',
      },
      {
        name: 'Le Cong Huynh',
        email: 'huynh@amata.com',
        department: '8',
        office: '1',
        phone: '0938727989',
      },
      {
        name: 'Le Ngoc Minh Hung',
        email: 'hung@amata.com',
        department: '8',
        office: '3',
        phone: '0933835502',
      },
      {
        name: 'Le Ngoc Tram',
        email: 'Tram@amata.com',
        department: '13',
        office: '2',
        phone: '0947995992',
      },
      {
        name: 'Le Nguyen Tam',
        email: 'tam@amata.com',
        department: '16',
        office: '1',
        phone: '0903022658',
      },
      {
        name: 'Le Thanh Bach',
        email: 'bach@amata.com',
        department: '8',
        office: '3',
        phone: '0938599020',
      },
      {
        name: 'Le Thi Huu Tinh',
        email: 'huutinh@amata.com',
        department: '16',
        office: '1',
        phone: '0933140268',
      },
      {
        name: 'Le Thi Kim Dung',
        email: 'kimdung@amata.com',
        department: '2',
        office: '2',
        phone: '0968415858',
      },
      {
        name: 'Le Thi Minh Hanh',
        email: 'minhhanh@amata.com',
        department: '1',
        office: '1',
        phone: '0909611123',
      },
      {
        name: 'Le Thi Quynh Trang',
        email: 'quynhtrang@amata.com',
        department: '6',
        office: '1',
        phone: '0966924346',
      },
      {
        name: 'Le Trung Hieu',
        email: 'hieu@amata.com',
        department: '8',
        office: '2',
        phone: '0356564522',
      },
      {
        name: 'Le Van Thanh Loc',
        email: 'thanhloc@amata.com',
        department: '4',
        office: '3',
        phone: '0984417636',
      },
      {
        name: 'Lieu Thi An Binh',
        email: 'binh@amata.com',
        department: '3',
        office: '1',
        phone: '0931838998',
      },
      {
        name: 'Lu Ngoc Trung Duong',
        email: 'trungduong@amata.com',
        department: '7',
        office: '1',
        phone: '0988423304',
      },
      {
        name: 'Luong Phuoc Sang',
        email: 'sang@amata.com',
        department: '11',
        office: '1',
        phone: '0918999449',
      },
      {
        name: 'Luong Phuoc Trung',
        email: 'trung@amata.com',
        department: '11',
        office: '1',
        phone: '0938099499',
      },
      {
        name: 'Ngo Doan Toan',
        email: 'doantoan@amata.com',
        department: '4',
        office: '2',
        phone: '0356657394',
      },
      {
        name: 'Ngo Thi Tuyet Hanh',
        email: 'tuyethanh@amata.com',
        department: '1',
        office: '3',
        phone: '0902618874',
      },
      {
        name: 'Ngo Van Bang',
        email: 'bang@amata.com',
        department: '15',
        office: '2',
        phone: '0334768500',
      },
      {
        name: 'Ngo Van Thuan',
        email: 'thuan@amata.com',
        department: '16',
        office: '2',
        phone: '0375075329',
      },
      {
        name: 'Nguyen Anh Tuan',
        email: 'anhtuan@amata.com',
        department: '7',
        office: '3',
        phone: '0868608700',
      },
      {
        name: 'Nguyen Cao Cuong',
        email: 'caocuong@amata.com',
        department: '13',
        office: '1',
        phone: '0982198421',
      },
      {
        name: 'Nguyen Dang Khoa',
        email: 'khoa@amata.com',
        department: '10',
        office: '4',
        phone: '0903112610',
      },
      {
        name: 'Nguyen Dinh Tuan',
        email: 'dinhtuan@amata.com',
        department: '4',
        office: '3',
        phone: '0907857462',
      },
      {
        name: 'Nguyen Duc Thang',
        email: 'thang@amata.com',
        department: '16',
        office: '2',
        phone: '0868168997',
      },
      {
        name: 'Nguyen Hieu Binh',
        email: 'hieubinh@amata.com',
        department: '9',
        office: '3',
        phone: '0364678845',
      },
      {
        name: 'Nguyen Hoang Dung',
        email: 'dung@amata.com',
        department: '15',
        office: '1',
        phone: '0917133866',
      },
      {
        name: 'Nguyen Hoang Nguyen',
        email: 'nguyen@amata.com',
        department: '8',
        office: '3',
        phone: '0909171778',
      },
      {
        name: 'Nguyen Huu Binh',
        email: 'huubinh@amata.com',
        department: '4',
        office: '3',
        phone: '0915746096',
      },
      {
        name: 'Nguyen Huu Nghi',
        email: 'huunghi@amata.com',
        department: '15',
        office: '1',
        phone: '0919124749',
      },
      {
        name: 'Nguyen Huy Hoang',
        email: 'huyhoang@amata.com',
        department: '12',
        office: '2',
        phone: '0763589628',
      },
      {
        name: 'Nguyen Kieu Phong',
        email: 'phong@amata.com',
        department: '15',
        office: '1',
        phone: '0908313726',
      },
      {
        name: 'Nguyen Le Cong Thien',
        email: 'thien@amata.com',
        department: '11',
        office: '4',
        phone: '0968230367',
      },
      {
        name: 'Nguyen Mai Anh',
        email: 'maianh@amata.com',
        department: '3',
        office: '1',
        phone: '0913942899',
      },
      {
        name: 'Nguyen Manh Huy',
        email: 'manhhuy@amata.com',
        department: '16',
        office: '3',
        phone: '0784642580',
      },
      {
        name: 'Nguyen Minh Dang',
        email: 'dang@amata.com',
        department: '1',
        office: '3',
        phone: '0903403876',
      },
      {
        name: 'Nguyen Ngoc Nhu',
        email: 'nhu@amata.com',
        department: '2',
        office: '1',
        phone: '0981657693',
      },
      {
        name: 'Nguyen Thanh Hoang',
        email: 'hoang@amata.com',
        department: '11',
        office: '3',
        phone: '0938322179',
      },
      {
        name: 'Nguyen Thanh Long',
        email: 'long@amata.com',
        department: '16',
        office: '2',
        phone: '0356801055',
      },
      {
        name: 'Nguyen Thien Sang',
        email: 'thiensang@amata.com',
        department: '16',
        office: '1',
        phone: '0565422242',
      },
      {
        name: 'Nguyen Thi Ha Trang',
        email: 'hatrang@amata.com',
        department: '13',
        office: '2',
        phone: '0836152607',
      },
      {
        name: 'Nguyen Thi Hoang Phuoc',
        email: 'phuoc@amata.com',
        department: '12',
        office: '1',
        phone: '0778256782',
      },
      {
        name: 'Nguyen Thi Kim Oanh',
        email: 'oanh@amata.com',
        department: '1',
        office: '3',
        phone: '0327577050',
      },
      {
        name: 'Nguyen Thi Loan Anh',
        email: 'loananh@amata.com',
        department: '10',
        office: '1',
        phone: '0909092912',
      },
      {
        name: 'Nguyen Thi Mai Huong',
        email: 'maihuong@amata.com',
        department: '13',
        office: '3',
        phone: '0358178238',
      },
      {
        name: 'Nguyen Thi Ngoc Anh',
        email: 'anh@amata.com',
        department: '13',
        office: '2',
        phone: '0389408879',
      },
      {
        name: 'Nguyen Thi Thu Huong',
        email: 'thuhuong@amata.com',
        department: '9',
        office: '3',
        phone: '0905442595',
      },
      {
        name: 'Nguyen Thi Thuy Huong',
        email: 'thuyhuong@amata.com',
        department: '8',
        office: '3',
        phone: '0907237320',
      },
      {
        name: 'Nguyen Thi Thuy Linh',
        email: 'linh@amata.com',
        department: '15',
        office: '2',
        phone: '0983166198',
      },
      {
        name: 'Nguyen Thi Tuyet',
        email: 'nguyentuyet@amata.com',
        department: '12',
        office: '2',
        phone: '0912329898',
      },
      {
        name: 'Nguyen Van Dan',
        email: 'dan@amata.com',
        department: '4',
        office: '2',
        phone: '0904737022',
      },
      {
        name: 'Nguyen Van Loc',
        email: 'loc@amata.com',
        department: '11',
        office: '2',
        phone: '0936301355',
      },
      {
        name: 'Nguyen Yen Nhi',
        email: 'nhi@amata.com',
        department: '6',
        office: '1',
        phone: '0933621901',
      },
      {
        name: 'Nomura Junta',
        email: 'nomura@amata.com',
        department: '13',
        office: '3',
        phone: '0852371097',
      },
      {
        name: 'Nong Thi Hong Lam',
        email: 'Lam@amata.com',
        department: '13',
        office: '2',
        phone: '0898280113',
      },
      {
        name: 'On Thi Mai',
        email: 'onmai@amata.com',
        department: '2',
        office: '1',
        phone: '0773747812',
      },
      {
        name: 'Pham Anh Tuan',
        email: 'tuan@amata.com',
        department: '16',
        office: '1',
        phone: '0972605576',
      },
      {
        name: 'Pham Hai Manh',
        email: 'manh@amata.com',
        department: '3',
        office: '2',
        phone: '0905240676',
      },
      {
        name: 'Pham Phu Cuong',
        email: 'cuong@amata.com',
        department: '15',
        office: '3',
        phone: '0907783040',
      },
      {
        name: 'Pham Tat Thanh',
        email: 'thanh@amata.com',
        department: '8',
        office: '2',
        phone: '0348814431',
      },
      {
        name: 'Pham Thi Ky Duyen',
        email: 'duyen@amata.com',
        department: '16',
        office: '2',
        phone: '0349051631',
      },
      {
        name: 'Pham Thi Thanh Nga',
        email: 'nga@amata.com',
        department: '13',
        office: '1',
        phone: '0586558655',
      },
      {
        name: 'Pham Tien Tue',
        email: 'tue@amata.com',
        department: '16',
        office: '1',
        phone: '0933996281',
      },
      {
        name: 'Pham Tieu Yen Linh',
        email: 'yenlinh@amata.com',
        department: '13',
        office: '2',
        phone: '0344271999',
      },
      {
        name: 'Pham Van Huy',
        email: 'huy@amata.com',
        department: '11',
        office: '2',
        phone: '0982415578',
      },
      {
        name: 'Phan Manh Ha',
        email: 'ha@amata.com',
        department: '8',
        office: '2',
        phone: '0398686675',
      },
      {
        name: 'Phung Nhu Trung',
        email: 'nhutrung@amata.com',
        department: '8',
        office: '4',
        phone: '0704679543',
      },
      {
        name: 'Quach Nguyen Duc',
        email: 'duc@amata.com',
        department: '9',
        office: '1',
        phone: '0868739169',
      },
      {
        name: 'Takeshi Omika',
        email: 'Omika@amata.com',
        department: '11',
        office: '2',
        phone: '0912670007',
      },
      {
        name: 'Thai Hoang Nam',
        email: 'nam@amata.com',
        department: '5',
        office: '3',
        phone: '0888057777',
      },
      {
        name: 'Tran Minh Quan',
        email: 'quan@amata.com',
        department: '8',
        office: '4',
        phone: '0945513896',
      },
      {
        name: 'Tran Ngoc Thu Thao',
        email: 'thao@amata.com',
        department: '12',
        office: '1',
        phone: '0903072703',
      },
      {
        name: 'Tran Ngoc Trung',
        email: 'ngoctrung@amata.com',
        department: '1',
        office: '2',
        phone: '0903261880',
      },
      {
        name: 'Tran Quang Duong',
        email: 'quangduong@amata.com',
        department: '4',
        office: '2',
        phone: '0977741298',
      },
      {
        name: 'Tran Quang Minh',
        email: 'minh@amata.com',
        department: '8',
        office: '2',
        phone: '0397192959',
      },
      {
        name: 'Tran Thai Son',
        email: 'thaison@amata.com',
        department: '11',
        office: '2',
        phone: '0936442692',
      },
      {
        name: 'Tran Thien Truong',
        email: 'thientruong@amata.com',
        department: '16',
        office: '3',
        phone: '0888878381',
      },
      {
        name: 'Tran Thi My Huyen',
        email: 'myhuyen@amata.com',
        department: '2',
        office: '3',
        phone: '0962369500',
      },
      {
        name: 'Tran Thi Thanh Thuy',
        email: 'thanhthuy@amata.com',
        department: '1',
        office: '1',
        phone: '0948223805',
      },
      {
        name: 'Tran Van Hien',
        email: 'hien@amata.com',
        department: '8',
        office: '2',
        phone: '0985952226',
      },
      {
        name: 'Tran Van Tran',
        email: 'tran@amata.com',
        department: '8',
        office: '4',
        phone: '0908142368',
      },
      {
        name: 'Trinh Thi Thu Hang',
        email: 'hang@amata.com',
        department: '13',
        office: '2',
        phone: '0981295669',
      },
      {
        name: 'Truong Khanh Ha',
        email: 'khanhha@amata.com',
        department: '8',
        office: '3',
        phone: '0964005731',
      },
      {
        name: 'Truong Lam Vu',
        email: 'vu@amata.com',
        department: '11',
        office: '3',
        phone: '0917606608',
      },
      {
        name: 'Vi Thanh Hoai',
        email: 'hoai@amata.com',
        department: '6',
        office: '2',
        phone: '0369208135',
      },
      {
        name: 'Vu Ngoc Diep',
        email: 'ngocdiep@amata.com',
        department: '13',
        office: '1',
        phone: '0772998725',
      },
      {
        name: 'Vu Nhu Quynh',
        email: 'nhuquynh@amata.com',
        department: '15',
        office: '2',
        phone: '0787060259',
      },
      {
        name: 'Vu Thi Bich Ngoc',
        email: 'ngoc@amata.com',
        department: '14',
        office: '1',
        phone: '0938638960',
      },
      {
        name: 'Vu Thi Hong',
        email: 'vuhong@amata.com',
        department: '1',
        office: '2',
        phone: '0965492333',
      },
      {
        name: 'Vu Thi Thuy',
        email: 'thuy@amata.com',
        department: '1',
        office: '2',
        phone: '0977059852',
      },
      {
        name: 'Vu Thi Thuy Ha',
        email: 'thuyha@amata.com',
        department: '2',
        office: '2',
        phone: '0988667887',
      },
      {
        name: 'Vu Trung Duc',
        email: 'trungduc@amata.com',
        department: '1',
        office: '2',
        phone: '0868453280',
      },
      {
        name: 'Vu Van Hai',
        email: 'vanhai@amata.com',
        department: '16',
        office: '2',
        phone: '0376236696',
      },
      {
        name: 'Vu Van Phu',
        email: 'phu@amata.com',
        department: '11',
        office: '2',
        phone: '0946311567',
      },
      {
        name: 'Vu Van Quyen',
        email: 'quyen@amata.com',
        department: '16',
        office: '2',
        phone: '0383422483',
      },
    ];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      await prisma.user.upsert({
        where: { email: user.email },
        update: { phone: user.phone },
        create: {
          name: user.name,
          email: user.email,
          departmentId: Number(user.department),
          officeId: Number(user.office),
          password: passwordHash,
        },
      });

      console.log(`Seed user ${i + 1}/${users.length}: ${user.name}`);
    }
    console.log('✅ User seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--office')) {
    await seedOffices();
  } else if (args.includes('--department')) {
    await seedDepartments();
  } else if (args.includes('--user')) {
    await seedUser();
  } else {
    console.log('Please specify a seed type. Available options:');
    console.log('  bun run seed --office');
    console.log('  bun run seed --department');
    console.log('  bun run seed --user');
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('Error in seed script:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma
      .$disconnect()
      .catch((e) => console.error('Error during disconnect:', e));
  });
