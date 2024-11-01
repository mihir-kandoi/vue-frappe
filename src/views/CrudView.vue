<script setup>
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import api from '@/main';
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useConfirm } from "primevue/useconfirm";

const confirm = useConfirm();
const props = defineProps(['which']);

const data = ref([]);
const getData = async () => {
    const response = await api.get(`${props.which}/`);
    data.value = response['data'];
};
onBeforeMount(async () => getData());

const add_member_submitted = ref(false);
const visible_add_member = ref(false);
const add_book_submitted = ref(false);
const visible_add_book = ref(false);

const addHandler = async (formData) => {
    if (props.which === 'books') {
        const date = new Date(formData['publication_date']);
        formData['publication_date'] = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
    }
    const response = await api.post(`${props.which}/`, formData);
    if (response.status == 201) {
        getData();
        alert("Add successful")
    } else {
        alert("Something went wrong, please validate input parameters.")
    }
    visible_add_member.value = false;
    add_member_submitted.value = true;
    visible_add_book.value = false;
    add_book_submitted.value = true;
}

const update = ref(false);
const update_submitted = ref(false);
const updateHandler = async (formData) => {
    if (props.which === 'books') {
        const date = new Date(formData['publication_date']);
        formData['publication_date'] = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
    }
    const response = await api.patch(`${props.which}/${props.which === 'members' ? formData['id'] : formData['bookID']}/`, formData);
    if (response.status == 200) {
        alert("Updation successful")
        getData();
    } else {
        alert("Something went wrong, please validate input parameters.")
    }

    if (props.which === 'members') {
        computedVisibilityMember.value = {};
    } else {
        computedVisibilityBook.value = {};
    }

    update.value = false;
    update_submitted.value = true
}

const selected = ref({});
const selectedCopy = ref({});
watch(selected, (_, __) => {
    if (deleteElement.value) {
        confirm.require({
            message: `Are you sure you want to delete ${(props.which).slice(0, -1)} ${props.which === 'members' ? selected.value['id'] : selected.value['bookID']}?`,
            header: "Confirm deletion",
            acceptLabel: "Delete",
            rejectLabel: "Cancel",
            accept: async () => {
                const response = await api.delete(`${props.which}/${props.which === 'members' ? selected.value['id'] : selected.value['bookID']}/`);
                if (response.status == 204) {
                    getData();
                    alert("Deletion successful");
                } else {
                    alert("Something went wrong");
                }
                selected.value = {};
                deleteElement.value = false;
            }, reject: () => {
                selected.value = {};
                deleteElement.value = false;
            },
            onHide: () => {
                selected.value = {};
                deleteElement.value = false;
            }
        });
    } else {
        selectedCopy.value = { ..._ };
        if (typeof selectedCopy['_rawValue']['bookID'] === 'number') {
            const [month, day, year] = selectedCopy['_rawValue']['publication_date'].split("/");
            selectedCopy['_rawValue']['publication_date'] = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
});

const computedVisibilityBook = computed({
    get() {
        return typeof selected.value['bookID'] === 'number' && !deleteElement.value;
    },
    set(_) {
        update.value = false;
        selected.value = {};
    }
});
const computedVisibilityMember = computed({
    get() {
        return typeof selected.value['id'] === 'number' && !deleteElement.value;
    },
    set(_) {
        update.value = false;
        selected.value = {};
    }
});

const deleteElement = ref(false);

const search_submitted = ref(false);
const visible_search = ref(false);
const searchHandler = async (formData) => {
    const response = await api.get(`books/`, {
        params: {
            title__contains: formData['name'],
            authors__contains: formData['authors']
        }
    });
    data.value = response['data'];
    visible_search.value = false;
    search_submitted.value = true;
};
</script>

<template>
    <div>
        <div v-if="which === 'members'" style="width: 60vw;">
            <Button label="Add a member" size="large" severity="secondary" @click="visible_add_member = true" />
            <Button label="Update a member" size="large" severity="secondary" style="margin-left: 18px;"
                @click="() => { update = true; deleteElement = false; }" />
            <Button label="Delete a member" size="large" severity="secondary" style="margin-left: 18px;"
                @click="() => { deleteElement = true; update = false; }" />
        </div>
        <div v-else>
            <Button label="Add Book" size="large" severity="secondary" @click="visible_add_book = true" />
            <Button label="Search for a Book" size="large" severity="secondary" style="margin-left: 18px;" @click="visible_search = true"/>
            <Button label="Update Book" size="large" severity="secondary" style="margin-left: 18px;"
                @click="() => { update = true; deleteElement = false; }" />
            <Button label="Delete Book" size="large" severity="secondary" style="margin-left: 18px;"
                @click="() => { deleteElement = true; update = false; }" />
        </div>

        <DataTable v-if="which === 'members'" :value="data" v-model:selection="selected">
            <Column v-if="update" selectionMode="single" headerStyle="width: 3rem" />
            <Column v-if="deleteElement" selectionMode="single" headerStyle="width: 3rem" />
            <Column field="id" header="ID"></Column>
            <Column field="name" header="Name"></Column>
            <Column field="number" header="Number"></Column>
            <Column field="email" header="Email"></Column>
            <Column field="outstanding" header="Outstanding amount"></Column>
            <template #footer>Total {{ data.length }} records</template>
        </DataTable>

        <DataTable v-else :value="data" paginator :rows="10" v-model:selection="selected">
            <Column v-if="update && props.which === 'books'" selectionMode="single" headerStyle="width: 3rem" />
            <Column v-if="deleteElement && props.which === 'books'" selectionMode="single" headerStyle="width: 3rem" />
            <Column field="bookID" header="ID"></Column>
            <Column field="title" header="Title"></Column>
            <Column field="authors" header="Authors"></Column>
            <Column field="average_rating" header="Average Rating"></Column>
            <Column field="isbn" header="ISBN"></Column>
            <Column field="isbn13" header="ISBN (13)"></Column>
            <Column field="language_code" header="Language Code"></Column>
            <Column field="num_pages" header="No. of pages"></Column>
            <Column field="ratings_count" header="Ratings Count"></Column>
            <Column field="text_reviews_count" header="Text Reviews Count"></Column>
            <Column field="publication_date" header="Publication Date"></Column>
            <Column field="publisher" header="Publisher"></Column>
            <Column field="qty_in_stock" header="Quantity In Stock"></Column>
            <template #footer>Total {{ data.length }} records</template>
        </DataTable>

        <Dialog v-model:visible="visible_search" modal header="Search book" :style="{ width: '35rem' }">
            <FormKit type="form" :form-class="search_submitted ? 'hide' : 'show'" submit-label="Search"
                @submit="searchHandler" :actions="false">
                <FormKit type="text" name="name" label="Name"/>
                <FormKit type="text" name="authors" label="Authors"/>
                <FormKit type="submit" label="Search" />
            </FormKit>
        </Dialog>

        <Dialog v-model:visible="visible_add_member" modal header="Add a member" :style="{ width: '35rem' }">
            <FormKit type="form" :form-class="add_member_submitted ? 'hide' : 'show'" submit-label="Add"
                @submit="addHandler" :actions="false">
                <FormKit type="text" name="name" label="Name" validation="required" />
                <FormKit type="number" name="number" label="Mobile Number" validation="required" />
                <FormKit type="email" name="email" label="Email" validation="required" />
                <FormKit type="submit" label="Add" />
            </FormKit>
        </Dialog>

        <Dialog v-model:visible="computedVisibilityMember" modal header="Update a member" :style="{ width: '35rem' }">
            <FormKit type="form" :form-class="update_submitted ? 'hide' : 'show'" submit-label="Update"
                @submit="updateHandler" :actions="false" v-model="selectedCopy">
                <FormKit type="text" name="name" label="Name" />
                <FormKit type="number" name="number" label="Mobile Number" />
                <FormKit type="email" name="email" label="Email" />
                <FormKit type="submit" label="Update" />
            </FormKit>
        </Dialog>

        <Dialog v-model:visible="visible_add_book" modal header="Add a book" :style="{ width: '35rem' }">
            <FormKit type="form" :form-class="add_book_submitted ? 'hide' : 'show'" submit-label="Add"
                @submit="addHandler" :actions="false">
                <FormKit type="number" name="bookID" number="integer" label="Book ID" validation="required" />
                <FormKit type="text" name="title" label="Title" validation="required" />
                <FormKit type="text" name="authors" label="Authors" validation="required" />
                <FormKit type="text" name="average_rating" label="Average Rating" validation="required" />
                <FormKit type="text" name="isbn" label="ISBN" validation="required" />
                <FormKit type="text" name="isbn13" label="ISBN-13" validation="required" />
                <FormKit type="text" name="language_code" label="Language Code" validation="required" />
                <FormKit type="number" name="num_pages" number="integer" label="Number of Pages"
                    validation="required" />
                <FormKit type="number" name="ratings_count" number="integer" label="Ratings Count"
                    validation="required" />
                <FormKit type="number" name="text_reviews_count" number="integer" label="Text Reviews Count"
                    validation="required" />
                <FormKit type="date" name="publication_date" label="Publication Date" validation="required" />
                <FormKit type="text" name="publisher" label="Publisher" validation="required" />
                <FormKit type="number" name="qty_in_stock" number="integer" label="Quantity in Stock"
                    validation="required" />
                <FormKit type="submit" label="Add" />
            </FormKit>
        </Dialog>

        <Dialog v-model:visible="computedVisibilityBook" modal header="Update a book" :style="{ width: '35rem' }">
            <FormKit type="form" :form-class="update_submitted ? 'hide' : 'show'" submit-label="Update"
                @submit="updateHandler" :actions="false" v-model="selectedCopy">
                <FormKit type="text" name="title" label="Title" validation="required" />
                <FormKit type="text" name="authors" label="Authors" validation="required" />
                <FormKit type="text" name="average_rating" label="Average Rating" validation="required" />
                <FormKit type="text" name="isbn" label="ISBN" validation="required" />
                <FormKit type="text" name="isbn13" label="ISBN-13" validation="required" />
                <FormKit type="text" name="language_code" label="Language Code" validation="required" />
                <FormKit type="number" name="num_pages" number="integer" label="Number of Pages"
                    validation="required" />
                <FormKit type="number" name="ratings_count" number="integer" label="Ratings Count"
                    validation="required" />
                <FormKit type="number" name="text_reviews_count" number="integer" label="Text Reviews Count"
                    validation="required" />
                <FormKit type="date" name="publication_date" label="Publication Date" validation="required" />
                <FormKit type="text" name="publisher" label="Publisher" validation="required" />
                <FormKit type="number" name="qty_in_stock" number="integer" label="Quantity in Stock"
                    validation="required" />
                <FormKit type="submit" label="Update" />
            </FormKit>
        </Dialog>

        <ConfirmDialog />
    </div>
</template>

<style scoped>
.max-w-\[20em\] {
    max-width: 100%;
}
</style>