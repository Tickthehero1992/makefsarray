PATH = "fs_dir/example2.bin"

#ll = [i for i in range(0, 256)]
ll = list()
SIZE_BYTES = 256
for i in range(0, int(SIZE_BYTES/256)):
    for j in range(0, 256):
        if j == 255:
            ll.append(254)
        else:
            ll.append(j)

bl = bytearray(ll)
with open(PATH, "wb") as fl:
    fl.write(bl)