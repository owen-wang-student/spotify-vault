import { useState, useEffect } from 'react';

import { UserHeader } from './Header'
import { checkValidSession, getRecent, getSnapshot, listSnapshots, saveSnapshot} from '../utils/data_access'

export function User(){
  const [data, setData] = useState(undefined);
  const [snapshots, setSnapshots] = useState(undefined)

  useEffect(() => {(async () => {
    await checkValidSession(); 
    try {
      getRecent(setData);
      listSnapshots(setSnapshots);
    } catch(e) {
      console.error(e);
    }
  })();}, []);

  return (
    <>
      <UserHeader />
      <section className="w-full h-full min-h-screen px-6 bg-background-secondary pb-12">
        <div className='flex flex-col gap-4 justify-center items-center max-w-6xl mx-auto'>
          {data ?
            <div className="animate-loadIn flex flex-row items-center justify-start gap-12 w-full mb-4">
              <img
                alt="No profile picture"
                src={data.avatar_url}
                className='text-t-secondary w-75 rounded-full'
              />
              <h1 className="text-t-primary text-7xl font-medium font-akshar">
                {data.username}
              </h1>
            </div>
            : 
            <></>
          }
          {data ?
            <>
              <div className="animate-loadIn grid grid-cols-3 gap-3 w-full">
                
                <div className="h-full bg-background-primary text-t-primary rounded-lg">
                  <div className='p-6'>
                    <h1 className='text-3xl font-semibold'>Listening Time</h1>
                    <div className="text-5xl font-medium my-6">
                      <span>{(Math.floor((data.listening_time / 3600000) % 24))}h{' '}</span>
                      <span>{("0" + Math.floor((data.listening_time / 60000) % 60)).slice(-2)}m{' '}</span>
                      <span>{("0" + Math.floor((data.listening_time / 1000) % 60)).slice(-2)}s</span>
                    </div>
                    <h1 className='text-3xl font-semibold mt-10 mb-5'>Top Genres</h1>
                    <div className="flex flex-col gap-4">
                      {data.top_genres.map((genre, index) => (
                        <div key={"genres" + index} className="px-2 flex flex-row gap-4 items-center">
                          <h2 className='text-lg'>
                            {index+1}.
                          </h2>
                          <h2 className='text-xl font-semibold'>
                            {genre}
                          </h2>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="h-full bg-background-primary text-t-primary rounded-lg">
                  <div className='p-6 flex flex-col gap-4'>
                    <h1 className='text-3xl font-semibold'>Top Songs</h1>
                    {data.top_songs.songs.map((item, index) => (
                      <div key={"songs" + index} className='flex flex-row items-center gap-4'>
                        <img 
                          alt="top songs" 
                          src={item.image.url} 
                          className='w-16 rounded-full'
                        />
                        <div className="flex flex-col w-full overflow-hidden">
                          <h2 className='text-lg font-semibold text-t-primary truncate w-11/12'>{item.name}</h2>
                          <h3 className='text-base text-t-secondary truncate w-11/12'>
                            {item.artist}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-full bg-background-primary text-t-primary rounded-lg">
                  <div className='p-6 flex flex-col gap-4'>
                    <h1 className='text-3xl font-semibold'>Top Artists</h1>
                    {data.top_artists.artists.map((item, index) => (
                      <div key={"artists" + index} className='flex flex-row items-center gap-4'>
                      <img 
                        alt="top artists" 
                        src={item.image.url} 
                        className='w-16 rounded-full'
                      />
                      <div className="flex flex-col w-full overflow-hidden">
                        <h2 className='text-lg font-semibold text-t-primary truncate w-11/12'>{item.name}</h2>
                      </div>
                    </div>
                    ))}
                  </div>
                </div>
              </div>
      
              <div className='animate-loadIn h-96 w-full bg-background-primary'>

              </div>
              
              <div className='min-h-96 h-full bg-background-primary text-t-primary rounded-lg p-8 w-full'>
                <h1 className='text-3xl font-semibold mb-4'>Snapshots</h1>
                {snapshots ? <>{snapshots.map((item, index) => {
                  const date = item.date.split('T')[0];
                  return (
                  <button 
                    onClick={(e) => {getSnapshot(index, setData)}}
                    className="rounded-sm border-2 border-stone-800 transition-colors hover:text-t-secondary hover:bg-background-tertiary px-1 m-1">
                    <h2 key={"snapshots" + index} className='text-2xl font-semibold text-t-primary'>
                    <span className="text-xl text-t-secondary">{snapshots.length-index + ": " }</span>
                      {index == 0 ? "Recent" : date}
                    </h2>
                  </button>)
                })}</>: "loading your snapshots..."}
              </div> 
            </>
          :
            <>
              <div className='flex flex-col justify-center align-middle h-full pt-40'>
                <h1 className='animate-pulse mx-auto text-t-secondary text-4xl'>
                  loading your data...
                </h1>
              </div>
            </>
          }
        </div>
      </section>
    </>
  )
}