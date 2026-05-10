-- Mrkoon PMS - Real email update v1
-- Source: mrkoon-chro/source/team-directory-verified-20260418.xlsx

update def.users set email = 'm.shalabi@mrkoonapp.com' where full_name_en = 'Mohamed Elsayed Shalabi';
update def.users set email = 'a.mamdouh@mrkoonapp.com' where full_name_en = 'Ahmed Mamdouh Abdelmoez';
update def.users set email = 'a.amir@mrkoonapp.com' where full_name_en = 'Ahmed Amir Ahmed';
update def.users set email = 'a.khater@mrkoonapp.com' where full_name_en = 'Ahmed Elsayed Khater';
update def.users set email = 'alaa.shalabi@mrkoonapp.com' where full_name_en = 'Alaa Shalabi';
update def.users set email = 'm.hussein@mrkoonapp.com' where full_name_en = 'Mohamed Hussein Zaaid';
update def.users set email = 'mohamed.waheed@mrkoonapp.com' where full_name_en = 'Mohamed Waheed Tawfeek';
update def.users set email = 'khaled_ahmed@mrkoonapp.com' where full_name_en = 'Khaled Ahmed Metwally';
update def.users set email = 'sayed_sobhy@mrkoonapp.com' where full_name_en = 'Sayed Sobhy Sayed Mohamed';
update def.users set email = 'ziad.moataz@mrkoonapp.com' where full_name_en = 'Ziad Moataz El Sayed';
update def.users set email = 'mohamed.ahmed@mrkoonapp.com' where full_name_en = 'Mohamed Ahmed Mousa';
update def.users set email = 'youssef.ahmed@mrkoonapp.com' where full_name_en = 'Youssef Mohamed Ahmed';
update def.users set email = 'samah@mrkoonapp.com' where full_name_en = 'Samah Esmail Khalil';
update def.users set email = 'wegdan@mrkoonapp.com' where full_name_en = 'Wegdan Osama Mohamed';
update def.users set email = 'mai_tarek@mrkoonapp.com' where full_name_en = 'Mai Tarek Mohamed Helal';
update def.users set email = 'samar_osama@mrkoonapp.com' where full_name_en = 'Samar Osama Hamed';
update def.users set email = 'ismael.zakaria@mrkoonapp.com' where full_name_en = 'Ismael Zakria Mahmoud';
update def.users set email = 'shams@mrkoonapp.com' where full_name_en = 'Amany Fawzy Shams';
update def.users set email = 'yassin_hisham@mrkoonapp.com' where full_name_en = 'Yassin Hesham Mohamed';
update def.users set email = 'mohamed_salah@mrkoonapp.com' where full_name_en = 'Mohamed Salah Eldeen El Sayed';
update def.users set email = 'ali.hassan@mrkoonapp.com' where full_name_en = 'Ali Mohamed Hassan';
update def.users set email = 'habiba@mrkoonapp.com' where full_name_en = 'Habiba Mohamed Hassan';
update def.users set email = 'mayar.badr@mrkoonapp.com' where full_name_en = 'Mayar Badr Saad';
update def.users set email = 'asmaa@mrkoonapp.com' where full_name_en = 'Asmaa Salah Abdallah';
update def.users set email = 'aya_hesham@mrkoonapp.com' where full_name_en = 'Aya Hesham Sayed';
update def.users set email = 'hussein_salah@mrkoonapp.com' where full_name_en = 'El-Hussien Salah Hamed Soliman';
update def.users set email = 'abdelrahman.salah@mrkoonapp.com' where full_name_en = 'Abdelrahman Saleh Naeem';
update def.users set email = 'tarnem_hatem@mrkoonapp.com' where full_name_en = 'Tarneem Hatem Awad';
update def.users set email = 'ahmed.soltan@mrkoonapp.com' where full_name_en = 'Ahmed Alaa Ramadan';
update def.users set email = 'rawan.sayed@mrkoonapp.com' where full_name_en = 'Rawan Sayed Ibrahiem';
update def.users set email = 'martina@mrkoonapp.com' where full_name_en = 'Martina Yousry Lotfy';
update def.users set email = 'ahmed.othman@mrkoonapp.com' where full_name_en = 'Ahmed Othman Ali';
update def.users set email = 'ahmed_mostafa@mrkoonapp.com' where full_name_en = 'Ahmed Mostafa';
update def.users set email = 'mostafa_omar@mrkoonapp.com' where full_name_en = 'Mustafa Omar Abdelmajeed';
update def.users set email = 'ahmedbony@mrkoonapp.com' where full_name_en = 'Ahmed Mostafa Ahmed';
update def.users set email = 'mohamed.ayman@mrkoonapp.com' where full_name_en = 'Mohamed Ayman Hassan Amer';
update def.users set email = 'mai_hisham@mrkoonapp.com' where full_name_en = 'Mai Hesham Ibraheim';
update def.users set email = 'ismael.ahmed@mrkoonapp.com' where full_name_en = 'Ismael Ahmed Ismael';

-- Name-mismatch: my roster used "Ahmed Mostafa (QA)" per cost-impact;
-- team-directory has just "Ahmed Mostafa". Same person.
update def.users set email = 'ahmed_mostafa@mrkoonapp.com' where full_name_en = 'Ahmed Mostafa (QA)';

-- Verify:
-- select email, full_name_en from def.users order by email;
