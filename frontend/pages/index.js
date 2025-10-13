import { useEffect, useState } from 'react';
import Histogram from '../components/Histogram';
import { useRouter } from 'next/router';
import Dropdown from '../components/Dropdown';

export default function Index() {
  const router = useRouter();
  const [createTime, setCreateTime] = useState([]);
  const [lastReview, setLastReview] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/records/info")
        const data = await res.json()
        if (data.success) {
          setCreateTime(data.createTime)
          setLastReview(data.lastReview)
        } else {
          console.log(data.error)
        }
      } catch (error) {
        console.log("Failed to fetch data: " + error)
      }
    };

    fetchData();
  }, []); // 参数2发生变化时才再次调用


  async function queryByCreateTime(date) {
    // 转ISO格式会改变日期，相当于变成UTC时间，所以不能使用
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 前补0
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    router.push(`/query/${formattedDate}`);
  }

  return (
    <div className='text-center items-center justify-center w-[800px] mx-auto bg-gray-100 p-4'>
      <h1 className='text-4xl'>Home Page</h1>
      <h4 className='text-xl'>Total words:</h4>
      <p className='text-base'>{createTime.length}</p>
      <h4 className='text-xl'>Create Trend</h4>
      <Histogram data={createTime} onClick={queryByCreateTime}></Histogram>
      <h4 className='text-xl'>Review Trend</h4>
      <Histogram data={lastReview} color="#b36b6b"></Histogram>
    </div>
  );
}