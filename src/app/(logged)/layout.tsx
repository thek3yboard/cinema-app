"use client";

import { useState, useRef, createRef, ChangeEvent } from 'react';
import { FilmsContext, initialPage, initialCurrentApiPages, initialSort } from "@/app/(logged)/FilmsContext";
import { SortType } from '@/types/types';
import { orderOptions, sortByOptions } from '@/assets/filtersData';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import Image from "next/image";
import logo from '@/assets/cinema.png';

export default function LoggedLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const [page, setPage] = useState(initialPage);
    const [currentApiPages, setCurrentApiPages] = useState(initialCurrentApiPages);
    const [sort, setSort] = useState<SortType>(initialSort);
    const sortRef = useRef(sort.key);
    const orderRef = useRef(sort.order_key);
    const screenRef = createRef<HTMLDivElement>();
    const pathname = usePathname();
    const {isOpen, onOpen, onClose} = useDisclosure();

    const handleClickPrevPage = () => {
      if(currentApiPages[0] === 1) {
        return;
      }
      screenRef.current!.scroll({
        top: 0,
        behavior: "smooth"
      });
      if(screenRef.current!.scrollTop !== 0) {
        setTimeout(() => {
          setCurrentApiPages([currentApiPages[0]-2, currentApiPages[1]-2]);
          setPage(p => p - 1);
        }, 1000);
      } else {
        setCurrentApiPages([currentApiPages[0]-2, currentApiPages[1]-2]);
        setPage(p => p - 1);
      }
    }

    const handleClickNextPage = () => {
      screenRef.current!.scroll({
        top: 0,
        behavior: "smooth"
      });
      if(screenRef.current!.scrollTop !== 0) {
        setTimeout(() => {
          setCurrentApiPages([currentApiPages[0]+2, currentApiPages[1]+2]);
          setPage(p => p + 1);
        }, 1000);
      } else {
        setCurrentApiPages([currentApiPages[0]+2, currentApiPages[1]+2]);
        setPage(p => p + 1);
      }
    }

    const handleChangeSort = (e: ChangeEvent<HTMLSelectElement>) => {
      sortRef.current = e.target.value;
    }

    const handleChangeOrder = (e: ChangeEvent<HTMLSelectElement>) => {
      orderRef.current = e.target.value;
    }

    const handleSetFilters = () => {
      const selectedOrder = orderOptions.find((option) => option.key === orderRef.current)!;
      const selectedSort = sortByOptions.find((option) => option.key === sortRef.current)!;
      setSort({ ...sort, key: selectedSort.key, label: selectedSort.label,
        order_key: selectedOrder.key, order_label: selectedOrder.label
      });
      setCurrentApiPages(initialCurrentApiPages);
      setPage(initialPage);
      onClose();
    }

    const handleOpen = () => {
      onOpen();
    }

    return (
      <FilmsContext.Provider value={{ page, setPage, currentApiPages, setCurrentApiPages, handleClickPrevPage, handleClickNextPage, sort }}>
        <>
        <div ref={screenRef} className="h-screen flex flex-col overflow-y-auto bg-gradient-to-b from-blueish-gray via-[#3f577c] to-blueish-gray">
          <div className="z-20 sticky top-0">
            <nav className="p-[6px] h-auto bg-gradient-to-r from-aero-blue to-blueish-gray border-b-2 border-slate-700">
              <Image className="ml-1" src={logo} alt="Logo" width={125} />
            </nav>
            { pathname === "/films" && <Button className="w-full bg-lapis-lazuli border-l-1 border-b-2 border-blueish-gray rounded-none" key="full" onClick={handleOpen}><FontAwesomeIcon icon={faSliders} size="xl" color="white" /></Button> }
          </div>
          { pathname === "/films" ?
            <>
              <div className="grow content-center my-4 2xl:overflow-hidden">
                {children}
              </div>
              <div className="h-6 flex justify-center">
                <footer className="h-6 text-nyanza">Copyright © 2024 Juan Ignacio Leiva</footer>
              </div>
            </>
          :
            <>
              <div className="grow">
                {children}
              </div>
              <div className="flex h-6 justify-center">
                <footer className="h-6 text-nyanza">Copyright © 2024 Juan Ignacio Leiva</footer>
              </div> 
            </>
          }
        </div>
        <Modal 
          size="full"
          isOpen={isOpen} 
          onClose={onClose}
          className="bg-gradient-to-b from-blueish-gray via-[#3f577c] to-blueish-gray"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Filter</ModalHeader>
                <ModalBody>
                  <Select
                    key="sort"
                    color="default"
                    label="Sort by"
                    placeholder={sort.label}
                    className="sm:w-1/12"
                    onChange={handleChangeSort}
                  >
                    {sortByOptions.map((option) => (
                      <SelectItem key={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    key="order"
                    color="default"
                    label="Order by"
                    placeholder={sort.order_label}
                    className="sm:w-1/12"
                    onChange={handleChangeOrder}
                  >
                    {orderOptions.map((option) => (
                      <SelectItem key={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                </ModalBody>
                <ModalFooter>
                  <Button color="success" onPress={handleSetFilters}>
                    Apply
                  </Button>
                  <Button color="danger" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
        </>
      </FilmsContext.Provider>
    );
  }
  